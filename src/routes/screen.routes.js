import express from "express";
import {addScreen, listScreens, getScreen} from "../controllers/screen.controller.js";

import {authenticateToken} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", listScreens);
router.get("/:id", getScreen);
router.post("/", authenticateToken, addScreen);

export default router;