import AppError from "../utils/AppError.js";

export const notFound = (req, _res, next) =>
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "An unexpected server error occurred.";

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors).map((item) => item.message).join(", ");
  }
  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier.";
  }
  if (error.code === 11000) {
    statusCode = 409;
    message = `A record with that ${Object.keys(error.keyPattern).join(", ")} already exists.`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack })
  });
};
