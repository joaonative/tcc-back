import express from "express";
import { createUser, login, logout, updateUser } from "../controllers/User";
import { validadeToken } from "../middleware/auth";

const router = express.Router();

router.get("/:id");
router.post("/", createUser);
router.post("/login", login);
router.get("/logout", logout);
router.patch("/update/:id", validadeToken, updateUser);

export default router;
