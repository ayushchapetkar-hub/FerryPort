import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import User from "../models/User.js";

const run = async () => {
  try {
    await connectDatabase();
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required in server/.env.");
    }
    if (ADMIN_PASSWORD.length < 8) throw new Error("ADMIN_PASSWORD must contain at least 8 characters.");

    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      console.log("Admin account already exists; no changes were made.");
      return;
    }

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: "9999999999",
      password: ADMIN_PASSWORD,
      role: "admin",
      status: "active",
      isBlocked: false
    });
    console.log(`Admin account created for ${ADMIN_EMAIL}.`);
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error("Admin seed failed:", error.message);
  process.exitCode = 1;
});
