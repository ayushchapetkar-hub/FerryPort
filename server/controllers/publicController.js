import Ferry from "../models/Ferry.js";
import Booking from "../models/Booking.js";
import ContactMessage from "../models/ContactMessage.js";
import Subscriber from "../models/Subscriber.js";
import Route from "../models/Route.js";
import Schedule from "../models/Schedule.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isApprovedConnection } from "../utils/portConnections.js";
import { completeExpiredJourneys } from "../services/completionService.js";

const formatSchedule = (schedule, bookedSeats = []) => ({
  id: schedule._id,
  name: schedule.ferry.name,
  ferryId: schedule.ferry._id,
  ferryCode: schedule.ferry.ferryCode,
  image: schedule.ferry.image,
  type: schedule.ferry.description || "Passenger Ferry",
  from: schedule.route.source,
  to: schedule.route.destination,
  date: schedule.travelDate,
  departure: schedule.departureTime,
  arrival: schedule.arrivalTime,
  duration: `${schedule.route.estimatedDuration} mins`,
  price: schedule.ticketPrice,
  taxPercent: schedule.taxPercent,
  serviceCharge: schedule.serviceCharge,
  convenienceFee: schedule.convenienceFee,
  discountPercent: schedule.discountPercent,
  totalSeats: schedule.totalSeats,
  seatsAvailable: schedule.availableSeats,
  soldOut: schedule.availableSeats === 0,
  bookedSeats,
  status: schedule.status,
  badge: schedule.availableSeats === 0 ? "Sold Out" : "Available",
  badgeType: schedule.availableSeats === 0 ? "limited" : "fast"
});

export const listFerries = asyncHandler(async (_req, res) => {
  const ferries = await Ferry.find({ status: "active" }).sort("name");
  res.json({ success: true, ferries });
});

export const listRoutes = asyncHandler(async (_req, res) => {
  const routes = await Route.find({ status: "active" }).sort("source destination");
  res.json({ success: true, routes });
});

export const searchSchedules = asyncHandler(async (req, res) => {
  await completeExpiredJourneys();
  const { source, destination, date } = req.query;
  if ((source || destination) && (!source || !destination)) {
    throw new AppError("Both source and destination are required.", 400);
  }
  if (source && !isApprovedConnection(source, destination)) {
    throw new AppError("That port connection is not approved.", 400);
  }
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError("Date must use YYYY-MM-DD format.", 400);
  }

  const routeFilter = { status: "active" };
  if (source) Object.assign(routeFilter, { source, destination });
  const routeIds = await Route.find(routeFilter).distinct("_id");

  const query = {
    route: { $in: routeIds },
    bookingEnabled: true,
    status: "scheduled",
    departureDateTime: { $gt: new Date() }
  };
  if (date) query.travelDate = date;

  const schedules = await Schedule.find(query)
    .populate({ path: "ferry", match: { status: "active" } })
    .populate("route")
    .sort("departureDateTime");

  res.json({
    success: true,
    schedules: schedules.filter(({ ferry }) => ferry).map(formatSchedule)
  });
});

export const getSchedule = asyncHandler(async (req, res) => {
  await completeExpiredJourneys();
  const schedule = await Schedule.findById(req.params.id).populate("ferry").populate("route");
  if (!schedule) throw new AppError("Schedule not found.", 404);
  const occupied = await Booking.find({
    schedule: schedule._id,
    bookingStatus: "confirmed"
  }).distinct("selectedSeats");
  res.json({ success: true, schedule: formatSchedule(schedule, occupied.flat()) });
});

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !phone || !subject || !message) {
    throw new AppError("All contact fields are required.", 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError("Enter a valid email.", 400);
  const contactMessage = await ContactMessage.create({ name, email, phone, subject, message });
  res.status(201).json({
    success: true,
    message: "Your inquiry has been received.",
    referenceId: contactMessage._id
  });
});

export const subscribe = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError("Enter a valid email.", 400);
  await Subscriber.findOneAndUpdate(
    { email },
    { $set: { active: true }, $setOnInsert: { email } },
    { upsert: true }
  );
  res.status(201).json({ success: true, message: "Subscription confirmed." });
});
