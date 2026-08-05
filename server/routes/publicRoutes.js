import { Router } from "express";
import {
  getSchedule, listFerries, listRoutes, searchSchedules, submitContactMessage, subscribe
} from "../controllers/publicController.js";

const router = Router();
router.get("/ferries", listFerries);
router.get("/routes", listRoutes);
router.get("/schedules/search", searchSchedules);
router.get("/schedules/:id", getSchedule);
router.post("/contact", submitContactMessage);
router.post("/subscribers", subscribe);
export default router;
