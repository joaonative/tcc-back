import express from "express";
import {
  createEvent,
  deleteEvent,
  getEvents,
  joinEvent,
} from "../controllers/Event";
import { validadeToken } from "../middleware/auth";

const router = express.Router();

router.get("/", validadeToken, getEvents);
router.post("/", validadeToken, createEvent);
router.put("/join/:id", validadeToken, joinEvent);
router.delete("/:id", validadeToken, deleteEvent);

export default router;
