import { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie } from "../services/movie.service.js";
import { createMovieSchema,  updateMovieSchema} from "../validators/movie.validator.js";

export const listMovies = async(req, res) => {
    try{
        const movies = await getAllMovies();
        return res.status(200).json({movies});
    }catch(error){
        console.error(error);
        return res.status(500).json({message: "Internal server error,"});
    }
};

export const getMovie = async(req, res) => {
    try{
        const movie = await getMovieById(req.params.id);
        if(!movie){
            return res.status(404).json({message: "Movie not found,"});
        }
        return res.status(200).json({movie});
    }catch(error){
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const addMovie = async (req, res) => {
    try {
        const validatedData = createMovieSchema.parse(req.body);

        const movie = await createMovie({
            ...validatedData,
            releaseDate: validatedData.releaseDate
                ? new Date(validatedData.releaseDate)
                : null,
        });

        return res.status(201).json({
            message: "Movie created successfully",
            movie,
        });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                message: "Invalid movie data",
                errors: error.issues,
            });
        }

        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const editMovie = async (req, res) => {
    try {
        const validatedData = updateMovieSchema.parse(req.body);
        if (Object.keys(validatedData).length === 0) {
            return res.status(400).json({
                message: "Provide at least one field to update",
            });
        }
        if (validatedData.releaseDate !== undefined) {
            validatedData.releaseDate = validatedData.releaseDate ? new Date(validatedData.releaseDate) : null;
        }
        const movie = await updateMovie(req.params.id, validatedData);
        return res.status(200).json({
            message: "Movie updated successfully",
            movie,
        });
    }
    catch (error) {
        if(error.name === "ZodError"){
            return res.status(400).json({
                message: "Invalid movie data",
                errors: error.issues,
            });
        }
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Movie not found" });
        }

        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const removeMovie = async (req, res) => {
    try {
        await deleteMovie(req.params.id);

        return res.status(200).json({
            message: "Movie deleted successfully",
        });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Movie not found" });
        }

        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};