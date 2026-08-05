import mongoose from "mongoose";

const ferrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ferryCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    totalCapacity: { type: Number, required: true, min: 1 },
    facilities: [{ type: String, trim: true }],
    status: { type: String, enum: ["active", "inactive", "maintenance"], default: "active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Ferry", ferrySchema);
