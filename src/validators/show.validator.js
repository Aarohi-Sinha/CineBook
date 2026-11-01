import { z } from "zod";

export const createShowSchema = z.object({
    movieId: z.string().trim().min(1, "Movie ID is required"),
    screenId: z.string().trim().min(1, "Screen ID is required"),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    price: z.string()
    .regex(/^[0-9]+(\.[0-9]{1,2})?$/, "Price must have at most 2 decimal places")
    .refine((value) => Number(value) > 0, "Price must be positive"),
}).transform((data) => ({
    ...data,
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime)
})).superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
        ctx.addIssue({
            code: "custom",
            path: ["endTime"],
            message: "End time must be after start time",
        });
    }
});