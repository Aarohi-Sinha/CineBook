import express from "express";
import { addTheatre, listTheatres, getTheatre } from "../controllers/theatre.controller.js";

import {authenticateToken} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", listTheatres);
router.get("/:id", getTheatre);
router.post("/", authenticateToken, addTheatre);

export default router;