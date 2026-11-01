import { z } from "zod";

export const createSeatSchema = z.object({
    row: z.string().trim().min(1, "Row is required"),
    number: z.number().int().positive("Seat number must be positive"),
    screenId: z.string().trim().min(1, "Screen ID is required"),
});
