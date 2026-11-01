import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    const token =
        authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : null;

    if (!token) {
        return res.status(401).json({
            message: "Access token required",
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            message: "Authentication configuration error",
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Ensure the token contains the fields our app needs
        if (
            typeof decoded === "string" ||
            typeof decoded.id !== "string" ||
            typeof decoded.email !== "string"
        ) {
            return res.status(401).json({
                message: "Invalid access token payload",
            });
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired access token",
        });
    }
};