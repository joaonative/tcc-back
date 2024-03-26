import express from "express";
import { getEvents, joinEvent } from "../controllers/Event";
import { validadeToken } from "../middleware/auth";

const router = express.Router();

router.get("/", validadeToken, getEvents);
router.get("/join/:id", validadeToken, joinEvent);

export default router;
