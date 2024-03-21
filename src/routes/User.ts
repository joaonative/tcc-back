import express from "express";
import { checkSession, createUser, login, logout } from "../controllers/User";

const router = express.Router();

router.get("/:id");
router.post("/", createUser);
router.post("/login", login);
router.get("/logout", logout);
router.get("/auth", checkSession);

export default router;
