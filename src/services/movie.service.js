import prisma from "../config/prisma.js"

export const getAllMovies = async () => {
    return await prisma.movie.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getMovieById = async (id) => {
    return await prisma.movie.findUnique({
        where: { id },
    });
};

export const createMovie = async (movieData) => {
    return await prisma.movie.create({
        data: movieData,
    });
};

export const updateMovie = async (id, movieData) => {
    return await prisma.movie.update({
        where: { id },
        data: movieData,
    });
};

export const deleteMovie = async (id) => {
    return await prisma.movie.delete({
        where: { id },
    });
    
};
