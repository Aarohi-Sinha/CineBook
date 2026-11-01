import {z} from "zod";

export const createScreenSchema = z.object({
    name: z.string().trim().min(1, "Screen name is required"),
    theatreId: z.string().trim().min(1,"Theatre ID is required")
});