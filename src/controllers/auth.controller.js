import {
    registerSchema,
    loginSchema,
} from "../validators/auth.validator.js";

import {
    registerUser,
    loginUser,
    getUserById,
} from "../services/auth.service.js";

export const register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const user = await registerUser(validatedData);
        return res.status(201).json({
            message: "Registration successful",
            user,
        });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                message: "Invalid input",
                errors: error.issues
            });
        }
        if (
            error.message === "Email already exists" ||
            error.code === "P2002"
        ) {
            return res.status(409).json({
                message: "Email already exists",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const login = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const result = await loginUser(validatedData);

        return res.status(200).json({
            message: "Login successful",
            user: result.user,
            accessToken: result.accessToken,
        });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                message: "Invalid input",
                errors: error.issues,
            });
        }

        if (error.message === "Invalid email or password") {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "Profile retrieved successfully",
            user,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
