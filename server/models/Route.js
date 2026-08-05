import mongoose from "mongoose";

const routeSchema = new mongoose.Schema(
  {
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    distance: { type: Number, min: 0, default: 0 },
    estimatedDuration: { type: Number, required: true, min: 1 },
    basePrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

routeSchema.index({ source: 1, destination: 1 }, { unique: true });

export default mongoose.model("Route", routeSchema);
