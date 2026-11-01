import express from "express";

import {
    listMovies,
    getMovie,
    addMovie,
    editMovie,
    removeMovie,
} from "../controllers/movie.controller.js";

import {authenticateToken} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", listMovies);
router.get("/:id", getMovie);
router.post("/", authenticateToken, addMovie);
router.patch("/:id", authenticateToken, editMovie);
router.delete("/:id", authenticateToken, removeMovie);

export default router;