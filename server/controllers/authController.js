import User from "../models/User.js";
import AdminLog from "../models/AdminLog.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createToken } from "../utils/tokens.js";

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    throw new AppError("Name, email, phone, and password are required.", 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError("Enter a valid email.", 400);
  if (!/^\d{10}$/.test(phone)) throw new AppError("Phone must contain 10 digits.", 400);
  if (password.length < 6) throw new AppError("Password must contain at least 6 characters.", 400);
  if (await User.exists({ email: email.toLowerCase() })) throw new AppError("Email is already registered.", 409);

  const user = await User.create({ name, email, phone, password });
  res.status(201).json({ success: true, token: createToken(user._id), user: safeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("Email and password are required.", 400);

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) throw new AppError("Invalid email or password.", 401);
  if (user.status !== "active" || user.isBlocked) throw new AppError("This account is inactive or blocked.", 403);

  if (user.role === "admin") {
    await AdminLog.create({
      admin: user._id,
      action: "admin login",
      entityType: "User",
      entityId: user._id,
      ipAddress: req.ip
    });
  }

  res.json({ success: true, token: createToken(user._id), user: safeUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: safeUser(req.user) });
});
