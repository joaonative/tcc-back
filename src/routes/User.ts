import express from "express";
import { createUser, login, logout } from "../controllers/User";

const router = express.Router();

router.get("/:id");
router.post("/", createUser);
router.post("/login", login);
router.get("/logout", logout);

export default router;
