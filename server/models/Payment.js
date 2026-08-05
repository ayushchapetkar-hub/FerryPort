import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    paymentMethod: { type: String, required: true },
    transactionReference: { type: String, required: true, unique: true },
    status: { type: String, enum: ["pending", "successful", "failed", "refunded"], default: "pending" },
    paidAt: Date,
    refundedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
