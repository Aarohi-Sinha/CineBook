import prisma from "../config/prisma.js";

export const createSeat = async(seatData) => {
    return await prisma.seat.create({
        data: seatData,
        include: {
            screen: true
        }
    });
};

export const getAllSeats = async() => {
    return await prisma.seat.findMany({
        include: {
            screen: true
        },
        orderBy: [
            {row: "asc"},
            {number: "asc"}
        ],
    });
};

export const getSeatsByScreen = async(screenId) => {
    return await prisma.seat.findMany({
        where: {screenId},
        orderBy: [
            {row: "asc"},
            {number: "asc"}
        ],
    });
};