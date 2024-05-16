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
  getLatestEventByOwner,
  createEventByCommunity,
} from "../controllers/Event";
import { validadeToken } from "../middleware/auth";

const router = express.Router();

router.get("/", validadeToken, getEvents);
router.get("/participant", validadeToken, getEventsIsParticipanting);
router.get("/owner/:id", validadeToken, getEventsByOwner);
router.get("/owner/latest/:id", validadeToken, getLatestEventByOwner);
router.get("/:eventId", validadeToken, getEventById);
router.post("/", validadeToken, createEvent);
router.post("/community", validadeToken, createEventByCommunity);
router.put("/join/:eventId", validadeToken, joinEvent);
router.get("/leave/:eventId", validadeToken, leaveEvent);
router.delete("/:eventId", validadeToken, deleteEvent);

export default router;
