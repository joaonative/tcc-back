import express from "express";
import { getCommunity } from "../controllers/Community";
import { validadeToken } from "../middleware/auth";

const router = express.Router();

router.get("/", validadeToken, getCommunity);

export default router;