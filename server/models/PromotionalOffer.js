import mongoose from "mongoose";

const promotionalOfferSchema = new mongoose.Schema(
  {
    offerName: { type: String, required: true, trim: true },
    offerCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "", trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minimumBookingAmount: { type: Number, default: 0, min: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number, default: null, min: 1 },
    usageCount: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

promotionalOfferSchema.pre("validate", function validateOffer(next) {
  if (this.validUntil <= this.validFrom) {
    this.invalidate("validUntil", "Offer expiry must be after its start date.");
  }
  if (this.discountType === "percentage" && this.discountValue > 100) {
    this.invalidate("discountValue", "Percentage discounts cannot exceed 100.");
  }
  if (this.usageLimit !== null && this.usageCount > this.usageLimit) {
    this.invalidate("usageCount", "Usage count cannot exceed the usage limit.");
  }
  next();
});

export default mongoose.model("PromotionalOffer", promotionalOfferSchema);
