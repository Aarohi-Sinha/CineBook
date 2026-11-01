
import express from "express";

import {
    addShow,
    listShows,
    getShow,
} from "../controllers/show.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", listShows);
router.get("/:id", getShow);
router.post("/", authenticateToken, addShow);

export default router;