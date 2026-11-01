
import {
    createShow,
    getAllShows,
    getShowsById,
} from "../services/show.service.js";

import { createShowSchema } from "../validators/show.validator.js";

export const addShow = async (req, res) => {
    try {
        const validatedData = createShowSchema.parse(req.body);
        const show = await createShow(validatedData);

        return res.status(201).json({
            message: "Show created successfully",
            show,
        });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                message: "Invalid show data",
                errors: error.issues,
            });
        }

        if (error.code === "SHOW_TIME_CONFLICT") {
            return res.status(409).json({
                message: error.message,
            });
        }

        if (error.code === "P2003") {
            return res.status(400).json({
                message: "Invalid movie ID or screen ID",
            });
        }

        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const listShows = async (req, res) => {
    try {
        const shows = await getAllShows();
        return res.status(200).json({ shows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getShow = async (req, res) => {
    try {
        const show = await getShowsById(req.params.id);

        if (!show) {
            return res.status(404).json({
                message: "Show not found",
            });
        }

        return res.status(200).json({ show });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
