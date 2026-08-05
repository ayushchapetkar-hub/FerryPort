import mongoose from "mongoose";
import AdminLog from "../models/AdminLog.js";
import Booking from "../models/Booking.js";
import ContactMessage from "../models/ContactMessage.js";
import Ferry from "../models/Ferry.js";
import Payment from "../models/Payment.js";
import PromotionalOffer from "../models/PromotionalOffer.js";
import Route from "../models/Route.js";
import Schedule from "../models/Schedule.js";
import User from "../models/User.js";
import Subscriber from "../models/Subscriber.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isApprovedConnection } from "../utils/portConnections.js";
import { completeExpiredJourneys } from "../services/completionService.js";
import { logAdminAction } from "../services/adminLogService.js";

const byId = (Model, id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid resource identifier.", 400);
  return Model.findById(id);
};

const parseScheduleTimes = (travelDate, departureTime, arrivalTime) => {
  const departureDateTime = new Date(`${travelDate}T${departureTime}:00`);
  let arrivalDateTime = new Date(`${travelDate}T${arrivalTime}:00`);
  if (arrivalDateTime <= departureDateTime) arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
  if (Number.isNaN(departureDateTime.getTime()) || Number.isNaN(arrivalDateTime.getTime())) {
    throw new AppError("Travel date and times are invalid.", 400);
  }
  return { departureDateTime, arrivalDateTime };
};

export const dashboard = asyncHandler(async (_req, res) => {
  await completeExpiredJourneys();
  const [
    totalUsers, totalBookings, confirmedBookings, pendingBookings, cancelledBookings,
    completedJourneys, revenue, paymentStats, activeFerries, activeRoutes,
    upcomingSchedules, soldOutSchedules, recentBookings, popularRoute, popularFerry
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Booking.countDocuments(),
    Booking.countDocuments({ bookingStatus: "confirmed" }),
    Booking.countDocuments({ bookingStatus: "pending" }),
    Booking.countDocuments({ bookingStatus: "cancelled" }),
    Booking.countDocuments({ bookingStatus: "completed" }),
    Payment.aggregate([{ $match: { status: "successful" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Payment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Ferry.countDocuments({ status: "active" }),
    Route.countDocuments({ status: "active" }),
    Schedule.countDocuments({ status: "scheduled", departureDateTime: { $gt: new Date() } }),
    Schedule.countDocuments({ status: "scheduled", availableSeats: 0 }),
    Booking.find().sort("-createdAt").limit(8).populate("user", "name email").populate({
      path: "schedule", populate: [{ path: "ferry", select: "name" }, { path: "route" }]
    }),
    Booking.aggregate([
      { $match: { bookingStatus: { $in: ["confirmed", "completed"] } } },
      { $group: { _id: "$schedule", count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 1 }
    ]),
    Booking.aggregate([
      { $match: { bookingStatus: { $in: ["confirmed", "completed"] } } },
      { $lookup: { from: "schedules", localField: "schedule", foreignField: "_id", as: "scheduleData" } },
      { $unwind: "$scheduleData" },
      { $group: { _id: "$scheduleData.ferry", count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 1 }
    ])
  ]);

  let mostPopularRoute = null;
  if (popularRoute[0]) {
    const schedule = await Schedule.findById(popularRoute[0]._id).populate("route");
    mostPopularRoute = schedule?.route || null;
  }
  const mostBookedFerry = popularFerry[0] ? await Ferry.findById(popularFerry[0]._id) : null;
  const paymentCounts = Object.fromEntries(paymentStats.map((item) => [item._id, item.count]));

  res.json({
    success: true,
    dashboard: {
      totalUsers, totalBookings, confirmedBookings, pendingBookings, cancelledBookings,
      completedJourneys, totalRevenue: revenue[0]?.total || 0,
      successfulPayments: paymentCounts.successful || 0,
      failedPayments: paymentCounts.failed || 0,
      activeFerries, activeRoutes, upcomingSchedules, soldOutSchedules,
      mostPopularRoute, mostBookedFerry, recentBookings
    }
  });
});

const getFilteredBookings = async (query) => {
  const filter = {};
  const {
    bookingId, passengerName, email, phone, ferry, source, destination,
    route, paymentStatus, bookingStatus, travelDate, date
  } = query;
  if (bookingId) filter.bookingId = { $regex: bookingId, $options: "i" };
  if (phone) filter.contactPhone = { $regex: phone };
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (bookingStatus) filter.bookingStatus = bookingStatus;
  if (email) filter.contactEmail = { $regex: email, $options: "i" };

  let bookings = await Booking.find(filter)
    .populate("user", "name email phone")
    .populate({ path: "schedule", populate: [{ path: "ferry" }, { path: "route" }] })
    .sort("-createdAt");
  const requestedDate = travelDate || date;
  bookings = bookings.filter((booking) => {
    const schedule = booking.schedule;
    const routeDocument = schedule?.route;
    const routeText = `${routeDocument?.source || ""} ${routeDocument?.destination || ""}`;
    return (!requestedDate || schedule?.travelDate === requestedDate)
      && (!ferry || schedule?.ferry?.name?.toLowerCase().includes(ferry.toLowerCase()))
      && (!source || routeDocument?.source === source)
      && (!destination || routeDocument?.destination === destination)
      && (!route || routeText.toLowerCase().includes(route.toLowerCase()))
      && (!passengerName || booking.passengers.some(({ name }) =>
        name.toLowerCase().includes(passengerName.toLowerCase())
      ));
  });
  return bookings;
};

export const listAdminBookings = asyncHandler(async (req, res) => {
  await completeExpiredJourneys();
  const bookings = await getFilteredBookings(req.query);
  res.json({ success: true, bookings });
});

const csvValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export const exportAdminBookings = asyncHandler(async (req, res) => {
  await completeExpiredJourneys();
  const bookings = await getFilteredBookings(req.query);
  const headers = [
    "Booking ID", "User name", "User email", "Phone number", "Passenger names",
    "Ferry name", "Source port", "Destination port", "Travel date", "Departure time",
    "Number of seats", "Selected seat numbers", "Price per seat", "Total amount",
    "Payment status", "Booking status", "Booking date"
  ];
  const rows = bookings.map((booking) => [
    booking.bookingId,
    booking.user?.name,
    booking.user?.email || booking.contactEmail,
    booking.contactPhone,
    booking.passengers.map(({ name }) => name).join("; "),
    booking.schedule?.ferry?.name,
    booking.schedule?.route?.source,
    booking.schedule?.route?.destination,
    booking.schedule?.travelDate,
    booking.schedule?.departureTime,
    booking.seatCount,
    booking.selectedSeats.join("; "),
    booking.pricePerSeat,
    booking.totalAmount,
    booking.paymentStatus,
    booking.bookingStatus,
    booking.bookedAt?.toISOString()
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvValue).join(",")).join("\r\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="ferryport-bookings-${Date.now()}.csv"`);
  res.send(`\uFEFF${csv}`);
});

export const getAdminBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("user", "name email phone")
    .populate({ path: "schedule", populate: [{ path: "ferry" }, { path: "route" }] });
  if (!booking) throw new AppError("Booking not found.", 404);
  res.json({ success: true, booking });
});

export const confirmAdminBooking = asyncHandler(async (req, res) => {
  const booking = await byId(Booking, req.params.id);
  if (!booking) throw new AppError("Booking not found.", 404);
  if (booking.paymentStatus !== "paid") throw new AppError("Only a paid booking can be confirmed.", 409);
  booking.bookingStatus = "confirmed";
  booking.ticketStatus = "upcoming";
  await booking.save();
  await logAdminAction(req, "booking confirmed", "Booking", booking._id);
  res.json({ success: true, booking });
});

export const completeAdminBooking = asyncHandler(async (req, res) => {
  const booking = await byId(Booking, req.params.id);
  if (!booking) throw new AppError("Booking not found.", 404);
  if (booking.bookingStatus !== "confirmed") throw new AppError("Only confirmed bookings can be completed.", 409);
  booking.bookingStatus = "completed";
  booking.ticketStatus = "completed";
  booking.completedAt = new Date();
  await booking.save();
  await logAdminAction(req, "booking completed", "Booking", booking._id);
  res.json({ success: true, booking });
});

export const deleteAdminBooking = asyncHandler(async (req, res) => {
  const booking = await byId(Booking, req.params.id);
  if (!booking) throw new AppError("Booking not found.", 404);
  if (booking.bookingStatus === "confirmed") {
    throw new AppError("Cancel an active confirmed booking before deleting it.", 409);
  }
  await Payment.deleteMany({ booking: booking._id });
  await booking.deleteOne();
  await logAdminAction(req, "booking deleted", "Booking", booking._id);
  res.json({ success: true, message: "Booking deleted." });
});

export const listFerries = asyncHandler(async (_req, res) =>
  res.json({ success: true, ferries: await Ferry.find().sort("name") }));

export const getFerry = asyncHandler(async (req, res) => {
  const ferry = await byId(Ferry, req.params.id);
  if (!ferry) throw new AppError("Ferry not found.", 404);
  const schedules = await Schedule.find({ ferry: ferry._id }).populate("route");
  res.json({ success: true, ferry, schedules });
});

export const createFerry = asyncHandler(async (req, res) => {
  const ferry = await Ferry.create({ ...req.body, createdBy: req.user._id });
  await logAdminAction(req, "ferry created", "Ferry", ferry._id, req.body);
  res.status(201).json({ success: true, ferry });
});

export const updateFerry = asyncHandler(async (req, res) => {
  const ferry = await Ferry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!ferry) throw new AppError("Ferry not found.", 404);
  await logAdminAction(req, "ferry updated", "Ferry", ferry._id, req.body);
  res.json({ success: true, ferry });
});

export const deleteFerry = asyncHandler(async (req, res) => {
  if (await Schedule.exists({ ferry: req.params.id, status: { $in: ["scheduled", "boarding", "departed"] } })) {
    throw new AppError("A ferry with active schedules cannot be deleted.", 409);
  }
  const ferry = await Ferry.findByIdAndDelete(req.params.id);
  if (!ferry) throw new AppError("Ferry not found.", 404);
  await logAdminAction(req, "ferry deleted", "Ferry", ferry._id);
  res.json({ success: true, message: "Ferry deleted." });
});

export const listRoutes = asyncHandler(async (_req, res) =>
  res.json({ success: true, routes: await Route.find().sort("source destination") }));

export const getRoute = asyncHandler(async (req, res) => {
  const route = await byId(Route, req.params.id);
  if (!route) throw new AppError("Route not found.", 404);
  res.json({ success: true, route });
});

const validateRoute = ({ source, destination }) => {
  if (!isApprovedConnection(source, destination)) throw new AppError("That port connection is not approved.", 400);
};

export const createRoute = asyncHandler(async (req, res) => {
  validateRoute(req.body);
  const route = await Route.create({ ...req.body, createdBy: req.user._id });
  await logAdminAction(req, "route created", "Route", route._id, req.body);
  res.status(201).json({ success: true, route });
});

export const updateRoute = asyncHandler(async (req, res) => {
  const current = await byId(Route, req.params.id);
  if (!current) throw new AppError("Route not found.", 404);
  validateRoute({ source: req.body.source || current.source, destination: req.body.destination || current.destination });
  Object.assign(current, req.body);
  await current.save();
  await logAdminAction(req, "route updated", "Route", current._id, req.body);
  res.json({ success: true, route: current });
});

export const deleteRoute = asyncHandler(async (req, res) => {
  if (await Schedule.exists({ route: req.params.id, status: { $in: ["scheduled", "boarding", "departed"] } })) {
    throw new AppError("A route with active schedules cannot be deleted.", 409);
  }
  const route = await Route.findByIdAndDelete(req.params.id);
  if (!route) throw new AppError("Route not found.", 404);
  await logAdminAction(req, "route deleted", "Route", route._id);
  res.json({ success: true, message: "Route deleted." });
});

export const listSchedules = asyncHandler(async (_req, res) => {
  await completeExpiredJourneys();
  const schedules = await Schedule.find().populate("ferry").populate("route").sort("-departureDateTime");
  res.json({ success: true, schedules });
});

export const getAdminSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id).populate("ferry").populate("route");
  if (!schedule) throw new AppError("Schedule not found.", 404);
  res.json({ success: true, schedule });
});

const validateScheduleInput = async (body, current = {}) => {
  const data = { ...current, ...body };
  const ferry = await Ferry.findById(data.ferry);
  const route = await Route.findById(data.route);
  if (!ferry || !route) throw new AppError("Ferry and route must exist.", 400);
  if (data.totalSeats > ferry.totalCapacity) throw new AppError("Total seats exceed ferry capacity.", 400);
  if (data.availableSeats > data.totalSeats) throw new AppError("Available seats cannot exceed total seats.", 400);
  const times = parseScheduleTimes(data.travelDate, data.departureTime, data.arrivalTime);
  if (times.departureDateTime <= new Date()) throw new AppError("Schedule departure must be in the future.", 400);
  return times;
};

export const createSchedule = asyncHandler(async (req, res) => {
  const times = await validateScheduleInput(req.body);
  const schedule = await Schedule.create({ ...req.body, ...times, createdBy: req.user._id });
  await logAdminAction(req, "schedule created", "Schedule", schedule._id, req.body);
  res.status(201).json({ success: true, schedule });
});

export const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await byId(Schedule, req.params.id);
  if (!schedule) throw new AppError("Schedule not found.", 404);
  if (schedule.status === "completed") throw new AppError("Completed schedules cannot be reopened or edited.", 409);
  const confirmedSeats = await Booking.aggregate([
    { $match: { schedule: schedule._id, bookingStatus: "confirmed" } },
    { $group: { _id: null, count: { $sum: "$seatCount" } } }
  ]);
  if (req.body.totalSeats && req.body.totalSeats < (confirmedSeats[0]?.count || 0)) {
    throw new AppError("Total seats cannot be lower than confirmed booked seats.", 409);
  }
  const current = schedule.toObject();
  const times = await validateScheduleInput(req.body, current);
  Object.assign(schedule, req.body, times);
  await schedule.save();
  await logAdminAction(req, req.body.ticketPrice ? "ticket price changed" : "schedule changed", "Schedule", schedule._id, req.body);
  res.json({ success: true, schedule });
});

export const changeScheduleStatus = asyncHandler(async (req, res) => {
  const schedule = await byId(Schedule, req.params.id);
  if (!schedule) throw new AppError("Schedule not found.", 404);
  if (schedule.status === "completed" && req.body.status !== "completed") {
    throw new AppError("A completed schedule cannot be reopened.", 409);
  }
  schedule.status = req.body.status;
  if (["cancelled", "completed", "departed"].includes(req.body.status)) schedule.bookingEnabled = false;
  await schedule.save();
  await logAdminAction(req, "schedule status changed", "Schedule", schedule._id, req.body);
  res.json({ success: true, schedule });
});

export const deleteSchedule = asyncHandler(async (req, res) => {
  if (await Booking.exists({ schedule: req.params.id, bookingStatus: { $in: ["pending", "confirmed"] } })) {
    throw new AppError("A schedule with active bookings cannot be deleted.", 409);
  }
  const schedule = await Schedule.findByIdAndDelete(req.params.id);
  if (!schedule) throw new AppError("Schedule not found.", 404);
  await logAdminAction(req, "schedule deleted", "Schedule", schedule._id);
  res.json({ success: true, message: "Schedule deleted." });
});

export const listUsers = asyncHandler(async (req, res) => {
  const query = req.query.search
    ? { $or: [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } }
    ] }
    : {};
  res.json({ success: true, users: await User.find(query).sort("-createdAt") });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await byId(User, req.params.id);
  if (!user) throw new AppError("User not found.", 404);
  const bookings = await Booking.find({ user: user._id }).populate({
    path: "schedule", populate: [{ path: "ferry" }, { path: "route" }]
  });
  res.json({ success: true, user, bookings });
});

const preventSelfAdminMutation = (req) => {
  if (String(req.user._id) === req.params.id) {
    throw new AppError("You cannot block, deactivate, or delete your own admin account.", 409);
  }
};

export const setUserBlock = (blocked) => asyncHandler(async (req, res) => {
  preventSelfAdminMutation(req);
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: blocked }, { new: true });
  if (!user) throw new AppError("User not found.", 404);
  await logAdminAction(req, blocked ? "user blocked" : "user unblocked", "User", user._id);
  res.json({ success: true, user });
});

export const setUserStatus = asyncHandler(async (req, res) => {
  if (req.body.status === "inactive") preventSelfAdminMutation(req);
  const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!user) throw new AppError("User not found.", 404);
  await logAdminAction(req, "user status changed", "User", user._id, req.body);
  res.json({ success: true, user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  preventSelfAdminMutation(req);
  if (await Booking.exists({ user: req.params.id, bookingStatus: { $in: ["pending", "confirmed"] } })) {
    throw new AppError("A user with active bookings cannot be deleted.", 409);
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError("User not found.", 404);
  await logAdminAction(req, "user deleted", "User", user._id);
  res.json({ success: true, message: "User deleted." });
});

export const listPayments = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const payments = await Payment.find(filter).populate("user", "name email").populate("booking").sort("-createdAt");
  res.json({ success: true, payments });
});

export const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("user", "name email").populate("booking");
  if (!payment) throw new AppError("Payment not found.", 404);
  res.json({ success: true, payment });
});

export const refundPayment = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let payment;
  try {
    await session.withTransaction(async () => {
      payment = await Payment.findById(req.params.id).session(session);
      if (!payment) throw new AppError("Payment not found.", 404);
      if (payment.status !== "successful") throw new AppError("Only successful payments can be refunded.", 409);

      const booking = await Booking.findById(payment.booking).session(session);
      if (!booking) throw new AppError("The payment booking no longer exists.", 409);

      if (booking.bookingStatus === "confirmed") {
        const schedule = await Schedule.findById(booking.schedule).session(session);
        if (schedule && schedule.departureDateTime > new Date() && schedule.status === "scheduled") {
          await Schedule.updateOne(
            { _id: schedule._id },
            [{ $set: { availableSeats: { $min: ["$totalSeats", { $add: ["$availableSeats", booking.seatCount] }] } } }],
            { session }
          );
          booking.bookingStatus = "cancelled";
          booking.ticketStatus = "cancelled";
          booking.cancelledAt = new Date();
        }
      }

      booking.paymentStatus = "refunded";
      await booking.save({ session });
      payment.status = "refunded";
      payment.refundedAt = new Date();
      await payment.save({ session });
    });
  } finally {
    await session.endSession();
  }
  await logAdminAction(req, "payment refunded", "Payment", payment._id);
  res.json({ success: true, payment });
});

export const listLogs = asyncHandler(async (_req, res) => {
  const logs = await AdminLog.find().populate("admin", "name email").sort("-createdAt").limit(500);
  res.json({ success: true, logs });
});

export const listPromotionalOffers = asyncHandler(async (_req, res) => {
  const promotions = await PromotionalOffer.find().sort("-createdAt");
  res.json({ success: true, promotions });
});

export const getPromotionalOffer = asyncHandler(async (req, res) => {
  const promotion = await byId(PromotionalOffer, req.params.id);
  if (!promotion) throw new AppError("Promotional offer not found.", 404);
  res.json({ success: true, promotion });
});

export const createPromotionalOffer = asyncHandler(async (req, res) => {
  const promotion = await PromotionalOffer.create({ ...req.body, createdBy: req.user._id });
  await logAdminAction(req, "promotional offer created", "PromotionalOffer", promotion._id, req.body);
  res.status(201).json({ success: true, promotion });
});

export const updatePromotionalOffer = asyncHandler(async (req, res) => {
  const promotion = await PromotionalOffer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!promotion) throw new AppError("Promotional offer not found.", 404);
  await logAdminAction(req, "promotional offer updated", "PromotionalOffer", promotion._id, req.body);
  res.json({ success: true, promotion });
});

export const setPromotionalOfferStatus = asyncHandler(async (req, res) => {
  const promotion = await PromotionalOffer.findByIdAndUpdate(
    req.params.id,
    { active: Boolean(req.body.active) },
    { new: true, runValidators: true }
  );
  if (!promotion) throw new AppError("Promotional offer not found.", 404);
  await logAdminAction(
    req,
    promotion.active ? "promotional offer enabled" : "promotional offer disabled",
    "PromotionalOffer",
    promotion._id
  );
  res.json({ success: true, promotion });
});

export const deletePromotionalOffer = asyncHandler(async (req, res) => {
  const promotion = await PromotionalOffer.findByIdAndDelete(req.params.id);
  if (!promotion) throw new AppError("Promotional offer not found.", 404);
  await logAdminAction(req, "promotional offer deleted", "PromotionalOffer", promotion._id);
  res.json({ success: true, message: "Promotional offer deleted." });
});

export const listContactMessages = asyncHandler(async (_req, res) => {
  const contacts = await ContactMessage.find().sort("-createdAt");
  res.json({ success: true, contacts });
});

export const setContactMessageStatus = asyncHandler(async (req, res) => {
  const contact = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!contact) throw new AppError("Contact inquiry not found.", 404);
  await logAdminAction(req, "contact inquiry status changed", "ContactMessage", contact._id, req.body);
  res.json({ success: true, contact });
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
  const contact = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!contact) throw new AppError("Contact inquiry not found.", 404);
  await logAdminAction(req, "contact inquiry deleted", "ContactMessage", contact._id);
  res.json({ success: true, message: "Contact inquiry deleted." });
});

export const listSubscribers = asyncHandler(async (_req, res) => {
  const subscribers = await Subscriber.find().sort("-createdAt");
  res.json({ success: true, subscribers });
});

export const setSubscriberStatus = asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findByIdAndUpdate(
    req.params.id,
    { active: Boolean(req.body.active) },
    { new: true }
  );
  if (!subscriber) throw new AppError("Subscriber not found.", 404);
  res.json({ success: true, subscriber });
});

export const deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
  if (!subscriber) throw new AppError("Subscriber not found.", 404);
  res.json({ success: true, message: "Subscriber deleted." });
});
