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
  createEventByCommunity,
  getEventByCommunity,
  searchEventsByName,
} from "../controllers/Event";
import { validadeToken } from "../middleware/auth";

const router = express.Router();

router.get("/", validadeToken, getEvents);
router.get("/search", validadeToken, searchEventsByName);
router.get("/participant", validadeToken, getEventsIsParticipanting);
router.get("/owner/:id", validadeToken, getEventsByOwner);
router.get("/:eventId", validadeToken, getEventById);
router.post("/", validadeToken, createEvent);
router.post("/community", validadeToken, createEventByCommunity);
router.get("/community/:communityId", validadeToken, getEventByCommunity);
router.put("/join/:eventId", validadeToken, joinEvent);
router.get("/leave/:eventId", validadeToken, leaveEvent);
router.delete("/:eventId", validadeToken, deleteEvent);

export default router;
