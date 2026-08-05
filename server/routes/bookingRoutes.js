import { Router } from "express";
import {
  cancelBooking,
  createBooking,
  demoPayment,
  getBooking,
  getMyBookings,
  getTicket
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.post("/bookings", createBooking);
router.get("/bookings/my-bookings", getMyBookings);
router.get("/bookings/:id/ticket", getTicket);
router.get("/bookings/:id", getBooking);
router.patch("/bookings/:id/cancel", cancelBooking);
router.post("/payments/demo", demoPayment);
export default router;
