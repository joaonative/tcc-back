import express from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  joinEvent,
  leaveEvent,
} from "../controllers/Event";
import { validadeToken } from "../middleware/auth";

const router = express.Router();

router.get("/", validadeToken, getEvents);
router.get("/:eventId", validadeToken, getEventById);
router.post("/", validadeToken, createEvent);
router.put("/join/:eventId", validadeToken, joinEvent);
router.get("/leave/:eventId", validadeToken, leaveEvent);
router.delete("/:eventId", validadeToken, deleteEvent);

export default router;
