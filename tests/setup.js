import prisma from "../src/config/prisma.js";
import { beforeAll, afterAll, beforeEach } from "vitest";

beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl || !databaseUrl.includes("/cinebook_test")) {
        throw new Error(
            "Safety check failed: tests must only run on cinebook_test"
        );
    }

    console.log("Connected to test database");
});

beforeEach(async () => {
    await prisma.bookingSeat.deleteMany();
    await prisma.showSeat.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.show.deleteMany();
    await prisma.seat.deleteMany();
    await prisma.screen.deleteMany();
    await prisma.theatre.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.user.deleteMany();
});

afterAll(async () => {
    await prisma.$disconnect();
});
