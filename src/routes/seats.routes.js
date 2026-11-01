import express from "express";

import { addSeat, listSeats, listSeatsByScreen } from "../controllers/seat.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", listSeats);
router.get("/screen/:screenId", listSeatsByScreen);
router.post("/", authenticateToken,addSeat);

export default router;