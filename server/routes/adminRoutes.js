import { Router } from "express";
import {
  changeScheduleStatus, completeAdminBooking, confirmAdminBooking, createFerry, createPromotionalOffer,
  createRoute, createSchedule, dashboard, deleteAdminBooking, deleteContactMessage, deleteFerry,
  deletePromotionalOffer, deleteRoute, deleteSchedule, deleteSubscriber, deleteUser,
  exportAdminBookings, getAdminBooking, getAdminSchedule,
  getFerry, getPayment, getPromotionalOffer, getRoute, getUser,
  listAdminBookings, listFerries, listLogs, listPayments, listRoutes, listSchedules, listUsers,
  listContactMessages, listPromotionalOffers, listSubscribers, refundPayment,
  setContactMessageStatus, setPromotionalOfferStatus, setSubscriberStatus, setUserBlock,
  setUserStatus, updateFerry, updatePromotionalOffer, updateRoute, updateSchedule
} from "../controllers/adminController.js";
import { cancelBooking } from "../controllers/bookingController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = Router();
router.use(protect, adminOnly);
router.get("/dashboard", dashboard);

router.get("/bookings", listAdminBookings);
router.get("/bookings/export", exportAdminBookings);
router.get("/bookings/:id", getAdminBooking);
router.patch("/bookings/:id/confirm", confirmAdminBooking);
router.patch("/bookings/:id/cancel", cancelBooking);
router.patch("/bookings/:id/complete", completeAdminBooking);
router.delete("/bookings/:id", deleteAdminBooking);

router.route("/ferries").get(listFerries).post(createFerry);
router.route("/ferries/:id").get(getFerry).put(updateFerry).delete(deleteFerry);
router.route("/routes").get(listRoutes).post(createRoute);
router.route("/routes/:id").get(getRoute).put(updateRoute).delete(deleteRoute);
router.route("/schedules").get(listSchedules).post(createSchedule);
router.route("/schedules/:id").get(getAdminSchedule).put(updateSchedule).delete(deleteSchedule);
router.patch("/schedules/:id/status", changeScheduleStatus);

router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.patch("/users/:id/block", setUserBlock(true));
router.patch("/users/:id/unblock", setUserBlock(false));
router.patch("/users/:id/status", setUserStatus);
router.delete("/users/:id", deleteUser);

router.get("/payments", listPayments);
router.get("/payments/:id", getPayment);
router.patch("/payments/:id/refund", refundPayment);
router.get("/logs", listLogs);
router.route("/promotions").get(listPromotionalOffers).post(createPromotionalOffer);
router.route("/promotions/:id")
  .get(getPromotionalOffer)
  .put(updatePromotionalOffer)
  .delete(deletePromotionalOffer);
router.patch("/promotions/:id/status", setPromotionalOfferStatus);
router.get("/contacts", listContactMessages);
router.patch("/contacts/:id/status", setContactMessageStatus);
router.delete("/contacts/:id", deleteContactMessage);
router.get("/subscribers", listSubscribers);
router.patch("/subscribers/:id/status", setSubscriberStatus);
router.delete("/subscribers/:id", deleteSubscriber);
export default router;
