import { z } from "zod";
export const createBookingSchema = z.object({
    showId: z.string().trim().min(1, "Show ID is required"),
    seatIds: z
        .array(z.string().trim().min(1))
        .min(1, "Select at least one seat")
        .refine((seatIds) => new Set(seatIds).size === seatIds.length,
            "Duplicate seat IDs are not allowed"
        ),
});