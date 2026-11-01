
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER USER
export const registerUser = async (userData) => {
    // 1. Check whether the email is already registered
    const existingUser = await prisma.user.findUnique({
        where: {
            email: userData.email,
        },
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    // 2. Hash the password before saving it
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 3. Create the user in the database
    const user = await prisma.user.create({
        data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
        },
    });

    // 4. Return only safe user details
    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
};

// LOGIN USER
export const loginUser = async (userData) => {
    const user = await prisma.user.findUnique({
        where: {
            email: userData.email,
        },
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(
        userData.password,
        user.password
    );
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    // 5. Generate an access token
    const accessToken = jwt.sign(
        {
            id: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m",
        }
    );

    // 6. Return safe user details and the token
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        accessToken,
    };
};

export const getUserById = async (userId) => {
    return await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
};
