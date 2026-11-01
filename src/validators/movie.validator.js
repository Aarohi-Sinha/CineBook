import { z } from "zod";

export const createMovieSchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().optional(),
    duration: z.number().int().positive(),
    language: z.string().trim().min(1),
    genre: z.string().trim().min(1),
    releaseDate: z.string().datetime().optional(),
});

export const updateMovieSchema = createMovieSchema.partial();