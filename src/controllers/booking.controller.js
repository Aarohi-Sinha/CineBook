import { createBooking, getUserBookings, getUserBookingById, cancelUserBooking } from "../services/booking.service.js";
import { createBookingSchema } from "../validators/booking.validator.js";

export const addBooking = async (req, res) => {
    try {
        const { showId, seatIds } = createBookingSchema.parse(req.body);

        const booking = await createBooking({
            userId: req.user.id,
            showId,
            seatIds,
        });

        return res.status(201).json({
            message: "Booking successful",
            booking,
        });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                message: "Invalid booking data",
                errors: error.issues,
            });
        }

        if (error.code === "SHOW_NOT_FOUND") {
            return res.status(404).json({ message: error.message });
        }

        if (
            error.code === "INVALID_SEATS" ||
            error.code === "SEATS_UNAVAILABLE"
        ) {
            return res.status(409).json({ message: error.message });
        }

        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const listMyBookings = async (req, res) => {
    try {
        const bookings = await getUserBookings(req.user.id);

        return res.status(200).json({ bookings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getMyBooking = async (req, res) => {
    try {
        const booking = await getUserBookingById(
            req.params.id,
            req.user.id
        );

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found",
            });
        }

        return res.status(200).json({ booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};


export const cancelBooking = async (req, res) => {
    try {
        const result = await cancelUserBooking(
            req.params.id,
            req.user.id
        );

        return res.status(200).json(result);
    } catch (error) {
        if (error.code === "BOOKING_NOT_FOUND") {
            return res.status(404).json({
                message: error.message,
            });
        }

        if (error.code === "BOOKING_ALREADY_CANCELLED") {
            return res.status(409).json({
                message: error.message,
            });
        }

        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};