import { createSeat, getAllSeats, getSeatsByScreen } from "../services/seat.service.js";
import { createSeatSchema } from "../validators/seat.validator.js";

export const addSeat = async(req, res) => {
    try{
        const validatedData = createSeatSchema.parse(req.body);
        const seat = await createSeat(validatedData);
        return res.status(201).json({
            message: "Seat created successfully",
            seat
        });
    }
    catch(error){
        if(error.name === "ZodError"){
            return res.status(400).json({
                message: "Invalid seat data",
                errors: error.issues
            });
        }
        if (error.code === "P2002") {
            return res.status(409).json({
                message: "This seat number already exists for the screen",
            });
        }

        if (error.code === "P2003") {
            return res.status(400).json({
                message: "Invalid screen ID",
            });
        }

        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const listSeats = async(req, res) => {
    try{
        const seats = await getAllSeats();
        return res.status(200).json({seats});
    }catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}; 

export const listSeatsByScreen = async(req,res) =>{
    try{
        const seats = await getSeatsByScreen(req.params.screenId);
        return res.status(200).json({seats});
    }catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};