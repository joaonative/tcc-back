import express from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  joinEvent,
  leaveEvent,
  getEventsByOwner,
  getEventsIsParticipanting,
} from "../controllers/Event";
import { validadeToken } from "../middleware/auth";

const router = express.Router();

router.get("/", validadeToken, getEvents);
router.get("/owner/:id", validadeToken, getEventsByOwner);
router.get("/:eventId", validadeToken, getEventById);
router.get("/participant", validadeToken, getEventsIsParticipanting);
router.post("/", validadeToken, createEvent);
router.put("/join/:eventId", validadeToken, joinEvent);
router.get("/leave/:eventId", validadeToken, leaveEvent);
router.delete("/:eventId", validadeToken, deleteEvent);

export default router;
