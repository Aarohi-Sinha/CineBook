import prisma from "../config/prisma.js";

export const createTheatre = async(theatreData) => {
    return await prisma.theatre.create({
        data: theatreData,
    });
};

export const getAllTheatres = async() => {
    return await prisma.theatre.findMany({
        include:{screens:true},
        orderBy: {createdAt: "desc"}
    });
};

export const getTheatreById = async (id) => {
    return await prisma.theatre.findUnique({
        where: { id },
        include: {
            screens: {
                include: {
                    seats: true,
                },
            },
        },
    });
};