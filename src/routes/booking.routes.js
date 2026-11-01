import express from "express";

import {
    addBooking,
    listMyBookings,
    getMyBooking, cancelBooking
} from "../controllers/booking.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticateToken, addBooking);
router.get("/", authenticateToken, listMyBookings);
router.get("/:id", authenticateToken, getMyBooking);
router.patch("/:id/cancel", authenticateToken, cancelBooking);

export default router;