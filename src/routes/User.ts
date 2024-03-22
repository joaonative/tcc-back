import express from "express";
import { createUser, login, logout, updateImageUrl } from "../controllers/User";
import { validadeToken } from "../middleware/auth";

const router = express.Router();

router.get("/:id");
router.post("/", createUser);
router.post("/login", login);
router.get("/logout", logout);
router.put("/:id", validadeToken, updateImageUrl);

export default router;
