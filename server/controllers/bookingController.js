import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import PromotionalOffer from "../models/PromotionalOffer.js";
import Schedule from "../models/Schedule.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { completeExpiredJourneys } from "../services/completionService.js";

const populateBooking = (query) =>
  query
    .populate("user", "name email phone")
    .populate({
      path: "schedule",
      populate: [{ path: "ferry" }, { path: "route" }]
    });

const createReference = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const createBooking = asyncHandler(async (req, res) => {
  const { scheduleId, passengers, contactName, contactEmail, contactPhone, selectedSeats, offerCode } = req.body;
  if (!scheduleId || !Array.isArray(passengers) || passengers.length === 0) {
    throw new AppError("Schedule and passenger details are required.", 400);
  }

  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) throw new AppError("Schedule not found.", 404);
  if (!schedule.bookingEnabled || schedule.status !== "scheduled" || schedule.departureDateTime <= new Date()) {
    throw new AppError("This schedule is no longer open for booking.", 409);
  }

  const seats = Array.isArray(selectedSeats)
    ? selectedSeats.map((seat) => String(seat).trim().toUpperCase())
    : passengers.map((passenger) => String(passenger.seatNumber || passenger.seat || "").trim().toUpperCase());
  if (seats.length !== passengers.length) throw new AppError("Each passenger must have one selected seat.", 400);
  if (seats.some((seat) => !/^S\d+$/.test(seat) || Number(seat.slice(1)) > schedule.totalSeats)) {
    throw new AppError("One or more seat numbers are invalid for this ferry.", 400);
  }
  if (new Set(seats).size !== seats.length) throw new AppError("Seat numbers must be unique.", 400);
  if (passengers.length > schedule.availableSeats) throw new AppError("Not enough seats are available.", 409);
  if (passengers.some(({ name, age }) => !String(name || "").trim() || Number(age) < 1 || Number(age) > 120)) {
    throw new AppError("Every passenger needs a valid name and age.", 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail || req.user.email)) {
    throw new AppError("Enter a valid contact email.", 400);
  }
  if (!/^\d{10}$/.test(contactPhone || req.user.phone)) {
    throw new AppError("Contact phone must contain 10 digits.", 400);
  }

  const confirmedSeatConflict = await Booking.exists({
    schedule: schedule._id,
    bookingStatus: "confirmed",
    selectedSeats: { $in: seats }
  });
  if (confirmedSeatConflict) throw new AppError("One or more selected seats are no longer available.", 409);

  const subtotal = schedule.ticketPrice * passengers.length;
  const taxAmount = subtotal * schedule.taxPercent / 100;
  const discountAmount = subtotal * schedule.discountPercent / 100;
  let promotionalOffer = null;
  let promotionalDiscountAmount = 0;
  if (offerCode) {
    const now = new Date();
    promotionalOffer = await PromotionalOffer.findOne({
      offerCode: String(offerCode).trim().toUpperCase(),
      active: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    });
    if (
      !promotionalOffer ||
      subtotal < promotionalOffer.minimumBookingAmount ||
      (promotionalOffer.usageLimit !== null && promotionalOffer.usageCount >= promotionalOffer.usageLimit)
    ) {
      throw new AppError("This promotional offer is invalid, expired, or unavailable for this booking.", 400);
    }
    promotionalDiscountAmount = promotionalOffer.discountType === "percentage"
      ? subtotal * promotionalOffer.discountValue / 100
      : promotionalOffer.discountValue;
  }
  const totalAmount = Math.max(
    0,
    subtotal + taxAmount + schedule.serviceCharge + schedule.convenienceFee
      - discountAmount - promotionalDiscountAmount
  );

  const booking = await Booking.create({
    bookingId: createReference("FP"),
    user: req.user._id,
    schedule: schedule._id,
    passengers: passengers.map((passenger, index) => ({
      name: passenger.name,
      age: Number(passenger.age),
      gender: passenger.gender,
      seatNumber: seats[index]
    })),
    contactName: contactName || passengers[0].name,
    contactEmail: contactEmail || req.user.email,
    contactPhone: contactPhone || req.user.phone,
    seatCount: passengers.length,
    selectedSeats: seats,
    pricePerSeat: schedule.ticketPrice,
    subtotal,
    taxAmount,
    serviceCharge: schedule.serviceCharge,
    convenienceFee: schedule.convenienceFee,
    discountAmount,
    promotionalOffer: promotionalOffer?._id,
    offerCode: promotionalOffer?.offerCode,
    promotionalDiscountAmount,
    totalAmount
  });

  res.status(201).json({ success: true, booking });
});

export const demoPayment = asyncHandler(async (req, res) => {
  const { bookingId, paymentResult, paymentMethod = "demo" } = req.body;
  const booking = await Booking.findOne({ bookingId, user: req.user._id });
  if (!booking) throw new AppError("Booking not found.", 404);

  if (booking.paymentStatus === "paid" && booking.bookingStatus === "confirmed") {
    const confirmed = await populateBooking(Booking.findById(booking._id));
    return res.json({ success: true, booking: confirmed, alreadyProcessed: true });
  }
  if (booking.bookingStatus !== "pending") throw new AppError("This booking cannot be paid.", 409);

  if (paymentResult !== "success") {
    booking.paymentStatus = "failed";
    await booking.save();
    await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        $set: {
          user: req.user._id,
          amount: booking.totalAmount,
          paymentMethod,
          status: "failed"
        },
        $setOnInsert: {
          paymentId: createReference("PAY"),
          transactionReference: createReference("TXN")
        }
      },
      { upsert: true, new: true }
    );
    throw new AppError("Demo payment failed. No seats were reserved.", 402);
  }

  const session = await mongoose.startSession();
  let confirmedBooking;
  try {
    await session.withTransaction(async () => {
      const freshBooking = await Booking.findById(booking._id).session(session);
      if (freshBooking.paymentStatus === "paid") {
        confirmedBooking = freshBooking;
        return;
      }

      const schedule = await Schedule.findOneAndUpdate(
        {
          _id: freshBooking.schedule,
          availableSeats: { $gte: freshBooking.seatCount },
          bookingEnabled: true,
          status: "scheduled",
          departureDateTime: { $gt: new Date() }
        },
        { $inc: { availableSeats: -freshBooking.seatCount } },
        { new: true, session }
      );
      if (!schedule) throw new AppError("Not enough seats are available.", 409);

      if (freshBooking.promotionalOffer) {
        const now = new Date();
        const offer = await PromotionalOffer.findOneAndUpdate(
          {
            _id: freshBooking.promotionalOffer,
            active: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now },
            $expr: {
              $or: [
                { $eq: ["$usageLimit", null] },
                { $lt: ["$usageCount", "$usageLimit"] }
              ]
            }
          },
          { $inc: { usageCount: 1 } },
          { new: true, session }
        );
        if (!offer) throw new AppError("The promotional offer is no longer available.", 409);
      }

      const seatConflict = await Booking.exists({
        _id: { $ne: freshBooking._id },
        schedule: freshBooking.schedule,
        bookingStatus: "confirmed",
        selectedSeats: { $in: freshBooking.selectedSeats }
      }).session(session);
      if (seatConflict) throw new AppError("One or more selected seats are no longer available.", 409);

      freshBooking.paymentStatus = "paid";
      freshBooking.bookingStatus = "confirmed";
      freshBooking.ticketStatus = "upcoming";
      await freshBooking.save({ session });

      await Payment.create(
        [{
          paymentId: createReference("PAY"),
          booking: freshBooking._id,
          user: req.user._id,
          amount: freshBooking.totalAmount,
          paymentMethod,
          transactionReference: createReference("TXN"),
          status: "successful",
          paidAt: new Date()
        }],
        { session }
      );
      confirmedBooking = freshBooking;
    });
  } finally {
    await session.endSession();
  }

  const result = await populateBooking(Booking.findById(confirmedBooking._id));
  res.json({ success: true, booking: result });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  await completeExpiredJourneys();
  const bookings = await populateBooking(
    Booking.find({ user: req.user._id }).sort("-createdAt")
  );
  res.json({ success: true, bookings });
});

export const getBooking = asyncHandler(async (req, res) => {
  await completeExpiredJourneys();
  const booking = await populateBooking(
    Booking.findOne({ _id: req.params.id, user: req.user._id })
  );
  if (!booking) throw new AppError("Booking not found.", 404);
  res.json({ success: true, booking });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let cancelled;
  try {
    await session.withTransaction(async () => {
      const query = { _id: req.params.id };
      if (req.user.role !== "admin") query.user = req.user._id;
      const booking = await Booking.findOne(query).session(session);
      if (!booking) throw new AppError("Booking not found.", 404);
      if (booking.bookingStatus === "cancelled") throw new AppError("Booking is already cancelled.", 409);
      if (!["pending", "confirmed"].includes(booking.bookingStatus)) {
        throw new AppError("A completed journey cannot be cancelled.", 409);
      }

      const schedule = await Schedule.findById(booking.schedule).session(session);
      if (!schedule || schedule.departureDateTime <= new Date() || ["departed", "completed"].includes(schedule.status)) {
        throw new AppError("This journey has already departed or completed.", 409);
      }

      if (booking.bookingStatus === "confirmed") {
        await Schedule.updateOne(
          { _id: schedule._id },
          [{ $set: { availableSeats: { $min: ["$totalSeats", { $add: ["$availableSeats", booking.seatCount] }] } } }],
          { session }
        );
      }

      booking.bookingStatus = "cancelled";
      booking.ticketStatus = "cancelled";
      booking.cancelledAt = new Date();
      if (booking.paymentStatus === "paid") booking.paymentStatus = "refunded";
      await booking.save({ session });
      await Payment.updateOne(
        { booking: booking._id, status: "successful" },
        { $set: { status: "refunded", refundedAt: new Date() } },
        { session }
      );
      cancelled = booking;
    });
  } finally {
    await session.endSession();
  }
  res.json({ success: true, booking: cancelled });
});

export const getTicket = getBooking;
