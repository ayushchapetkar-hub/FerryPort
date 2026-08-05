import Booking from "../models/Booking.js";
import Schedule from "../models/Schedule.js";

export const completeExpiredJourneys = async () => {
  const now = new Date();
  const expired = await Schedule.find({
    status: { $in: ["scheduled", "boarding", "departed"] },
    departureDateTime: { $lte: now }
  }).select("_id");

  if (!expired.length) return 0;
  const scheduleIds = expired.map(({ _id }) => _id);

  await Schedule.updateMany(
    { _id: { $in: scheduleIds } },
    { $set: { status: "completed", bookingEnabled: false } }
  );
  await Booking.updateMany(
    { schedule: { $in: scheduleIds }, bookingStatus: "confirmed" },
    {
      $set: {
        bookingStatus: "completed",
        ticketStatus: "completed",
        completedAt: now
      }
    }
  );

  return scheduleIds.length;
};
