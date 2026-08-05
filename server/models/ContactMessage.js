import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, match: [/^\d{10}$/, "Phone must contain 10 digits."] },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, minlength: 10 },
    status: { type: String, enum: ["new", "in-progress", "resolved"], default: "new" }
  },
  { timestamps: true }
);

export default mongoose.model("ContactMessage", contactMessageSchema);
