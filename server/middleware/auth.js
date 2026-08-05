import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) throw new AppError("Authentication is required.", 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Your session is invalid or has expired.", 401);
  }

  const user = await User.findById(payload.userId);
  if (!user) throw new AppError("The account no longer exists.", 401);
  if (user.status !== "active" || user.isBlocked) {
    throw new AppError("This account is inactive or blocked.", 403);
  }

  req.user = user;
  next();
});

export const adminOnly = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    return next(new AppError("Administrator access is required.", 403));
  }
  next();
};
