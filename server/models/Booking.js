import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    gender: { type: String, required: true, trim: true },
    seatNumber: { type: String, required: true, uppercase: true, trim: true }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },
    passengers: { type: [passengerSchema], validate: [(value) => value.length > 0, "Passengers are required."] },
    contactName: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    seatCount: { type: Number, required: true, min: 1 },
    selectedSeats: [{ type: String, uppercase: true, trim: true }],
    pricePerSeat: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, required: true, min: 0 },
    serviceCharge: { type: Number, default: 0, min: 0 },
    convenienceFee: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    promotionalOffer: { type: mongoose.Schema.Types.ObjectId, ref: "PromotionalOffer" },
    offerCode: { type: String, uppercase: true, trim: true },
    promotionalDiscountAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    bookingStatus: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
    ticketStatus: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
    bookedAt: { type: Date, default: Date.now },
    cancelledAt: Date,
    completedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
