import express from "express";
import {
  createCommunity,
  getCommunity,
  getCommunitiesIsParticipanting,
  joinCommunity,
  leaveCommunity,
  deleteCommunity,
} from "../controllers/Community";
import { validadeToken } from "../middleware/auth";

const router = express.Router();

router.get("/", validadeToken, getCommunity);
router.get("/participant", validadeToken, getCommunitiesIsParticipanting);
router.post("/", validadeToken, createCommunity);
router.put("/join/:communityId", validadeToken, joinCommunity);
router.get("/leave/:communityId", validadeToken, leaveCommunity);
router.delete("/:communityId", validadeToken, deleteCommunity);

export default router;
