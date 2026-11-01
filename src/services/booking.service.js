
import prisma from "../config/prisma.js";

export const createBooking = async ({ userId, showId, seatIds }) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Find the show and its price
        const show = await tx.show.findUnique({
            where: { id: showId },
        });

        if (!show) {
            const error = new Error("Show not found");
            error.code = "SHOW_NOT_FOUND";
            throw error;
        }

        // 2. Find the physical seats requested for this show's screen
        const seats = await tx.seat.findMany({
            where: {
                id: { in: seatIds },
                screenId: (await tx.show.findUnique({
                    where: { id: showId },
                    select: { screenId: true },
                })).screenId,
            },
        });

        if (seats.length !== seatIds.length) {
            const error = new Error(
                "One or more seats do not belong to this show's screen"
            );
            error.code = "INVALID_SEATS";
            throw error;
        }

        // 3. Ensure ShowSeat records exist for the selected seats
        await tx.showSeat.createMany({
            data: seatIds.map((seatId) => ({
                showId,
                seatId,
                status: "AVAILABLE",
            })),
            skipDuplicates: true,
        });

        // 4. Atomically claim only seats that are still AVAILABLE
        const claimed = await tx.showSeat.updateMany({
            where: {
                showId,
                seatId: { in: seatIds },
                status: "AVAILABLE",
            },
            data: {
                status: "BOOKED",
            },
        });

        if (claimed.count !== seatIds.length) {
            const error = new Error(
                "One or more selected seats are already booked"
            );
            error.code = "SEATS_UNAVAILABLE";
            throw error;
        }

        // 5. Calculate total on the server
        const total = Number(show.price) * seatIds.length;

        // 6. Create the booking
        const booking = await tx.booking.create({
            data: {
                userId,
                showId,
                total: total.toFixed(2),
                seats: {
                    create: seatIds.map((seatId) => ({
                        showSeat: {
                            connect: {
                                showId_seatId: { showId, seatId },
                            },
                        },
                    })),
                },
            },
            include: {
                seats: {
                    include: {
                        showSeat: {
                            include: {
                                seat: true,
                            },
                        },
                    },
                },
                show: {
                    include: {
                        movie: true,
                        screen: {
                            include: {
                                theatre: true,
                            },
                        },
                    },
                },
            },
        });

        return booking;
    });
};


export const getUserBookings = async (userId) => {
    return await prisma.booking.findMany({
        where: { userId },
        include: {
            seats: {
                include: {
                    showSeat: {
                        include: {
                            seat: true,
                        },
                    },
                },
            },
            show: {
                include: {
                    movie: true,
                    screen: {
                        include: {
                            theatre: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getUserBookingById = async (bookingId, userId) => {
    return await prisma.booking.findFirst({
        where: {
            id: bookingId,
            userId,
        },
        include: {
            seats: {
                include: {
                    showSeat: {
                        include: {
                            seat: true,
                        },
                    },
                },
            },
            show: {
                include: {
                    movie: true,
                    screen: {
                        include: {
                            theatre: true,
                        },
                    },
                },
            },
        },
    });
};

export const cancelUserBooking = async (bookingId, userId) => {
    return await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findFirst({
            where: {
                id: bookingId,
                userId,
            },
            include: {
                seats: true,
            },
        });

        if (!booking) {
            const error = new Error("Booking not found");
            error.code = "BOOKING_NOT_FOUND";
            throw error;
        }

        if (booking.status === "CANCELLED") {
            const error = new Error("Booking is already cancelled");
            error.code = "BOOKING_ALREADY_CANCELLED";
            throw error;
        }

        await tx.booking.update({
            where: { id: bookingId },
            data: { status: "CANCELLED" },
        });

        const showSeatIds = booking.seats.map(
            (bookingSeat) => bookingSeat.showSeatId
        );

        await tx.showSeat.updateMany({
            where: {
                id: { in: showSeatIds },
                status: "BOOKED",
            },
            data: {
                status: "AVAILABLE",
            },
        });

        return { message: "Booking cancelled successfully" };
    });
};
