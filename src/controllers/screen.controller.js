import {createScreen, getAllScreens, getScreenById} from "../services/screen.service.js";

import {createScreenSchema} from "../validators/screen.validator.js";

export const addScreen = async(req, res) => {
    try{
        const validatedData = createScreenSchema.parse(req.body);
        const screen = await createScreen(validatedData);
        return res.status(201).json({
            message: "Screen created successfully",
            screen,
        })
    }
    catch(error){
        if (error.name === "ZodError") {
            return res.status(400).json({
                message: "Invalid screen data",
                errors: error.issues,
            });
        }

        if (error.code === "P2002") {
            return res.status(409).json({
                message: "This screen already exists in the theatre",
            });
        }

        if (error.code === "P2003") {
            return res.status(400).json({
                message: "Invalid theatre ID",
            });
        }

        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export const listScreens = async(req, res) => {
    try{
        const screens = await getAllScreens();
        return res.status(200).json({screens});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const getScreen = async(req, res) => {
    try{
        const screen = await getScreenById(req.params.id);
        if(!screen){
            return res.status(404).json({
                message: "Screen not found"
            });
        }
        return res.status(200).json({ screen });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            message:"Internal server error"
        });
    }
};