import { createTheatre, getAllTheatres, getTheatreById } from  "../services/theatre.service.js";
import { createTheatreSchema } from "../validators/theatre.validator.js";

export const addTheatre = async(req, res) => {
    try{
        const validatedData = createTheatreSchema.parse(req.body);
        const theatre = await createTheatre(validatedData);    
        return res.status(201).json({
            message: "Theatre created successfully",
            theatre,
        });
    }catch(error){
        if(error.name === "ZodError"){
            return res.status(400).json({
                message: "Invalid theatre data",
                errors: error.issues
            });
        }
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const listTheatres = async(req, res) => {
    try{
        const theatres = await getAllTheatres();
        return res.status(200).json({theatres});
    }
    catch(error){
        console.error(error);
         return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getTheatre = async(req, res) => {
    try{
        const theatre = await getTheatreById(req.params.id);
        if (!theatre) {
            return res.status(404).json({
                message: "Theatre not found",
            });
        }
        return res.status(200).json({ theatre });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};