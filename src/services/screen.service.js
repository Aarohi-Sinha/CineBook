import prisma from "../config/prisma.js";

export const createScreen = async(screenData) => {
    return await prisma.screen.create({
        data: screenData,
        include:{
            theatre: true
        }
    });
};

export const getAllScreens = async() => {
    return await prisma.screen.findMany({
        include: {
            theatre:true,
            seats: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getScreenById = async(id) => {
    return await prisma.screen.findUnique({
        where: {id},
        include: {
            theatre: true,
            seats:true,
        }
    });
};
