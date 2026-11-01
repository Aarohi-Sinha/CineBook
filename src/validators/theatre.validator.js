import { z } from "zod";

export const createTheatreSchema = z.object({
    name: z.string().trim().min(1, "Theatre name is required"),
    city: z.string().trim().min(1, "City is required"),
    address: z.string().trim().min(1, "Address is required"),
});