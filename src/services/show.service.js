import prisma from "../config/prisma.js";

export const createShow = async(showData) => {
    const overlappingshow = await prisma.show.findFirst({
        where: {
            screenId: showData.screenId,
            startTime: {lt: showData.endTime},
            endTime: {gt: showData.startTime}
        }
    });
    if(overlappingshow){
        const error = new Error("This screen already has a show during that time");
        error.code = "SHOW_TIME_CONFLICT";
        throw error;
    }
    return await prisma.show.create({
        data: showData,
        include: {
            movie: true,
            screen: {
                include: {
                    theatre: true,                
                },
            },
        },
    });
};

export const getAllShows = async() => {
    return await prisma.show.findMany({
        include: {
            movie: true,
            screen: {
                include: {
                    theatre:true,
                },
            },
        },
        orderBy: {
            startTime: "asc"
        }
    });
};

export const getShowsById = async(id) => {
    return await prisma.show.findUnique({
        where: {id},
        include: {
            movie: true,
            screen: {
                include: {
                    theatre: true,
                },
            },
        },
    });
};