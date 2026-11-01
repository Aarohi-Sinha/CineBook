import express from "express";
import authRoutes from "./routes/auth.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import theatreRoutes from "./routes/theatre.routes.js";
import screenRoutes from "./routes/screen.routes.js";
import seatRoutes from "./routes/seats.routes.js";
import showRoutes from "./routes/shows.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/movies", movieRoutes);
app.use("/theatres", theatreRoutes);
app.use("/screens", screenRoutes);
app.use("/seats",seatRoutes);
app.use("/shows", showRoutes);
app.use("/bookings", bookingRoutes);

app.get("/", (req, res) => {
    res.json({ message: "CineBook API" });
});

export default app;