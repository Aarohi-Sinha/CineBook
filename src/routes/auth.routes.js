import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
import express from "express";
import { login } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getProfile } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/login", login);

router.post("/register", register);

router.get("/profile", authenticateToken, getProfile);

export default router;