import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    ferry: { type: mongoose.Schema.Types.ObjectId, ref: "Ferry", required: true },
    route: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
    travelDate: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    departureDateTime: { type: Date, required: true },
    arrivalDateTime: { type: Date, required: true },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    ticketPrice: { type: Number, required: true, min: 0 },
    taxPercent: { type: Number, default: 5, min: 0 },
    serviceCharge: { type: Number, default: 0, min: 0 },
    convenienceFee: { type: Number, default: 0, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    bookingEnabled: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["scheduled", "boarding", "departed", "completed", "cancelled"],
      default: "scheduled"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

scheduleSchema.index({ ferry: 1, route: 1, departureDateTime: 1 }, { unique: true });

export default mongoose.model("Schedule", scheduleSchema);
