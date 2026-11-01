import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

const createUserData = (prefix) => ({
    name: "Test User",
    email: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    password: "StrongPass123!",
});

const createShowTestSetup = async () => {
    const token = await getAuthToken();

    // Create movie
    const movieResponse = await request(app)
        .post("/movies")
        .set("Authorization", `Bearer ${token}`)
        .send(createMovieData());

    expect(movieResponse.status).toBe(201);

    const movieId = movieResponse.body.movie.id;

    // Create theatre
    const theatreResponse = await request(app)
        .post("/theatres")
        .set("Authorization", `Bearer ${token}`)
        .send({
            name: "Test Theatre",
            city: "Jaipur",
            address: "Malviya Nagar",
        });

    expect(theatreResponse.status).toBe(201);

    // Create screen
    const screenResponse = await request(app)
        .post("/screens")
        .set("Authorization", `Bearer ${token}`)
        .send({
            name: "Screen 1",
            theatreId: theatreResponse.body.theatre.id,
        });

    expect(screenResponse.status).toBe(201);

    const screenId = screenResponse.body.screen.id;

    // Create seats
    const seat1Response = await request(app)
        .post("/seats")
        .set("Authorization", `Bearer ${token}`)
        .send({
            row: "A",
            number: 1,
            screenId,
        });

    expect(seat1Response.status).toBe(201);

    const seat2Response = await request(app)
        .post("/seats")
        .set("Authorization", `Bearer ${token}`)
        .send({
            row: "A",
            number: 2,
            screenId,
        });

    expect(seat2Response.status).toBe(201);

    // Create another screen and a seat for invalid-seat tests
    const secondScreenResponse = await request(app)
        .post("/screens")
        .set("Authorization", `Bearer ${token}`)
        .send({
            name: "Screen 2",
            theatreId: theatreResponse.body.theatre.id,
        });

    expect(secondScreenResponse.status).toBe(201);

    const foreignSeatResponse = await request(app)
        .post("/seats")
        .set("Authorization", `Bearer ${token}`)
        .send({
            row: "B",
            number: 1,
            screenId: secondScreenResponse.body.screen.id,
        });

    expect(foreignSeatResponse.status).toBe(201);

    // Create show with a future start time
    const startTime = new Date(Date.now() + 86400000);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    const showData = {
        movieId,
        screenId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        price: "250.50",
    };

    const showResponse = await request(app)
        .post("/shows")
        .set("Authorization", `Bearer ${token}`)
        .send(showData);

    expect(showResponse.status).toBe(201);

    return {
        token,
        movieId,
        screenId,
        showId: showResponse.body.show.id,
        seat1Id: seat1Response.body.seat.id,
        seat2Id: seat2Response.body.seat.id,
        foreignSeatId: foreignSeatResponse.body.seat.id,
        showData,
    };
};

const getAuthToken = async () => {
    const userData = createUserData("movie-test");

    await request(app)
        .post("/auth/register")
        .send(userData);

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email: userData.email,
            password: userData.password,
        });

    return loginResponse.body.accessToken;
};

const createMovieData = () => ({
    title: "Test Movie",
    description: "A movie created for automated testing",
    duration: 120,
    language: "English",
    genre: "Action",
    releaseDate: "2026-10-17T00:00:00.000Z",
});

describe("CineBook API", () => {
    it("should return a successful response from the root endpoint", async () => {
        const response = await request(app).get("/");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "CineBook API",
        });
    });

    it("should register a new userr successfully", async () => {
        const userData = {
            name: "Test User",
            email: `test-${Date.now()}@example.com`,
            password: "StronPass123!"
        };
        const response = await request(app)
            .post("/auth/register")
            .send(userData);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Registration successful");
        expect(response.body.user).toEqual(
            expect.objectContaining({
                name: userData.name,
                email: userData.email,
            })
        );
        expect(response.body.user).not.toHaveProperty("password");
    });
    it("should reject registration with invalid input", async () => {
        const userData = {
            name: "Al",
            email: "invalid-email",
            password: "123",
        };

        const response = await request(app)
            .post("/auth/register")
            .send(userData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid input");
        expect(response.body.errors).toBeDefined();
    });
    const createUserData = (prefix) => ({
        name: "Test User",
        email: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
        password: "StrongPass123!",
    });
    it("should reject registration with an existing email", async () => {
        const userData = createUserData("duplicate");

        await request(app)
            .post("/auth/register")
            .send(userData);

        const response = await request(app)
            .post("/auth/register")
            .send(userData);

        expect(response.status).toBe(409);
        expect(response.body.message).toBe("Email already exists");
    });


    it("should login an existing user successfully", async () => {
        const userData = createUserData("login");

        await request(app)
            .post("/auth/register")
            .send(userData);

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: userData.email,
                password: userData.password,
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Login successful");
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.user.email).toBe(userData.email);
    });


    it("should reject login with incorrect credentials", async () => {
        const userData = createUserData("wrong-password");

        await request(app)
            .post("/auth/register")
            .send(userData);

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: userData.email,
                password: "WrongPassword123!",
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid email or password");
    });


    it("should protect the profile route using JWT authentication", async () => {
        const userData = createUserData("profile");

        await request(app)
            .post("/auth/register")
            .send(userData);

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                email: userData.email,
                password: userData.password,
            });

        const token = loginResponse.body.accessToken;

        const unauthorizedResponse = await request(app)
            .get("/auth/profile");

        expect(unauthorizedResponse.status).toBe(401);

        const profileResponse = await request(app)
            .get("/auth/profile")
            .set("Authorization", `Bearer ${token}`);

        expect(profileResponse.status).toBe(200);
        expect(profileResponse.body.message).toBe("Profile retrieved successfully");
        expect(profileResponse.body.user.email).toBe(userData.email);
    });
    it("should list movies without authentication", async () => {
        const response = await request(app)
            .get("/movies");

        expect(response.status).toBe(200);
        expect(response.body.movies).toBeDefined();
        expect(Array.isArray(response.body.movies)).toBe(true);
    });
    it("should reject movie creation without authentication", async () => {
        const response = await request(app)
            .post("/movies")
            .send(createMovieData());

        expect(response.status).toBe(401);
    });
    it("should reject invalid movie data", async () => {
        const token = await getAuthToken();

        const response = await request(app)
            .post("/movies")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "",
                duration: -10,
                language: "English",
                genre: "Action",
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid movie data");
    });
    it("should create, retrieve, update and delete a movie", async () => {
        const token = await getAuthToken();
        const movieData = createMovieData();

        // CREATE
        const createResponse = await request(app)
            .post("/movies")
            .set("Authorization", `Bearer ${token}`)
            .send(movieData);

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.movie.title).toBe(movieData.title);

        const movieId = createResponse.body.movie.id;

        // READ
        const getResponse = await request(app)
            .get(`/movies/${movieId}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.movie.id).toBe(movieId);

        // UPDATE
        const updateResponse = await request(app)
            .patch(`/movies/${movieId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Updated Test Movie",
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.movie.title).toBe("Updated Test Movie");

        // DELETE
        const deleteResponse = await request(app)
            .delete(`/movies/${movieId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.message).toBe("Movie deleted successfully");

        // VERIFY DELETION
        const verifyResponse = await request(app)
            .get(`/movies/${movieId}`);

        expect(verifyResponse.status).toBe(404);
    });
    it("should return 404 when a movie does not exist", async () => {
        const response = await request(app)
            .get("/movies/nonexistent-movie-id");

        expect(response.status).toBe(404);
    });
    it("should list all theatres", async () => {
        const response = await request(app).get("/theatres");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.theatres)).toBe(true);
    });
    it("should reject theatre creation without authentication", async () => {
        const response = await request(app)
            .post("/theatres")
            .send({
                name: "Test Theatre",
                city: "Jaipur",
                address: "Test Address",
            });

        expect(response.status).toBe(401);
    });
    it("should reject invalid theatre data", async () => {
        const token = await getAuthToken();

        const response = await request(app)
            .post("/theatres")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "",
                city: "",
                address: "",
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid theatre data");
    });
    it("should create and retrieve a theatre", async () => {
        const token = await getAuthToken();

        const theatreData = {
            name: "Test Theatre",
            city: "Jaipur",
            address: "Malviya Nagar, Jaipur",
        };

        const createResponse = await request(app)
            .post("/theatres")
            .set("Authorization", `Bearer ${token}`)
            .send(theatreData);

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.theatre.name).toBe(theatreData.name);

        const theatreId = createResponse.body.theatre.id;

        const getResponse = await request(app)
            .get(`/theatres/${theatreId}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.theatre.id).toBe(theatreId);
        expect(getResponse.body.theatre.city).toBe(theatreData.city);
    });
    it("should return 404 when a theatre does not exist", async () => {
        const response = await request(app)
            .get("/theatres/nonexistent-theatre-id");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Theatre not found");
    });
    it("should list all screens", async () => {
        const response = await request(app).get("/screens");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.screens)).toBe(true);
    });
    it("should reject screen creation without authentication", async () => {
        const response = await request(app)
            .post("/screens")
            .send({
                name: "Screen 1",
                theatreId: "some-theatre-id",
            });

        expect(response.status).toBe(401);
    }); it("should reject invalid screen data", async () => {
        const token = await getAuthToken();

        const response = await request(app)
            .post("/screens")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "",
                theatreId: "",
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid screen data");
    });
    it("should reject screen creation with an invalid theatre ID", async () => {
        const token = await getAuthToken();

        const response = await request(app)
            .post("/screens")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Screen 1",
                theatreId: "nonexistent-theatre-id",
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid theatre ID");
    });
    it("should create and retrieve a screen", async () => {
        const token = await getAuthToken();

        // First create a theatre
        const theatreResponse = await request(app)
            .post("/theatres")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Screen Test Theatre",
                city: "Jaipur",
                address: "Malviya Nagar",
            });

        expect(theatreResponse.status).toBe(201);

        const theatreId = theatreResponse.body.theatre.id;

        // Create a screen inside that theatre
        const createResponse = await request(app)
            .post("/screens")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Screen 1",
                theatreId,
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.screen.name).toBe("Screen 1");
        expect(createResponse.body.screen.theatre.id).toBe(theatreId);

        const screenId = createResponse.body.screen.id;

        // Retrieve the screen
        const getResponse = await request(app)
            .get(`/screens/${screenId}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.screen.id).toBe(screenId);
        expect(getResponse.body.screen.theatre.id).toBe(theatreId);
    });
    it("should return 404 when a screen does not exist", async () => {
        const response = await request(app)
            .get("/screens/nonexistent-screen-id");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Screen not found");
    });
    it("should list all seats", async () => {
        const response = await request(app).get("/seats");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.seats)).toBe(true);
    });
    it("should reject seat creation without authentication", async () => {
        const response = await request(app)
            .post("/seats")
            .send({
                row: "A",
                number: 1,
                screenId: "some-screen-id",
            });

        expect(response.status).toBe(401);
    });
    it("should reject invalid seat data", async () => {
        const token = await getAuthToken();

        const response = await request(app)
            .post("/seats")
            .set("Authorization", `Bearer ${token}`)
            .send({
                row: "",
                number: -1,
                screenId: "",
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid seat data");
    });
    it("should reject seat creation with an invalid screen ID", async () => {
        const token = await getAuthToken();

        const response = await request(app)
            .post("/seats")
            .set("Authorization", `Bearer ${token}`)
            .send({
                row: "A",
                number: 1,
                screenId: "nonexistent-screen-id",
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid screen ID");
    });
    it("should create a seat and retrieve seats by screen", async () => {
        const token = await getAuthToken();

        // Create theatre
        const theatreResponse = await request(app)
            .post("/theatres")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Seat Test Theatre",
                city: "Jaipur",
                address: "Malviya Nagar",
            });

        expect(theatreResponse.status).toBe(201);

        // Create screen
        const screenResponse = await request(app)
            .post("/screens")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Screen 1",
                theatreId: theatreResponse.body.theatre.id,
            });

        expect(screenResponse.status).toBe(201);

        const screenId = screenResponse.body.screen.id;

        // Create seat
        const seatResponse = await request(app)
            .post("/seats")
            .set("Authorization", `Bearer ${token}`)
            .send({
                row: "A",
                number: 1,
                screenId,
            });

        expect(seatResponse.status).toBe(201);
        expect(seatResponse.body.seat.row).toBe("A");
        expect(seatResponse.body.seat.number).toBe(1);
        expect(seatResponse.body.seat.screen.id).toBe(screenId);

        // Retrieve seats belonging to this screen
        const getResponse = await request(app)
            .get(`/seats/screen/${screenId}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.seats.length).toBeGreaterThan(0);
        expect(getResponse.body.seats[0].screenId).toBe(screenId);
    });
    it("should reject duplicate seat numbers in the same screen", async () => {
        const token = await getAuthToken();

        const theatreResponse = await request(app)
            .post("/theatres")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Duplicate Seat Theatre",
                city: "Jaipur",
                address: "Test Address",
            });

        const screenResponse = await request(app)
            .post("/screens")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Screen 1",
                theatreId: theatreResponse.body.theatre.id,
            });

        const screenId = screenResponse.body.screen.id;

        const seatData = {
            row: "A",
            number: 1,
            screenId,
        };

        const firstResponse = await request(app)
            .post("/seats")
            .set("Authorization", `Bearer ${token}`)
            .send(seatData);

        expect(firstResponse.status).toBe(201);

        const secondResponse = await request(app)
            .post("/seats")
            .set("Authorization", `Bearer ${token}`)
            .send(seatData);

        expect(secondResponse.status).toBe(409);
        expect(secondResponse.body.message)
            .toBe("This seat number already exists for the screen");
    });
    it("should list all shows", async () => {
        const response = await request(app).get("/shows");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.shows)).toBe(true);
    });
    it("should reject show creation without authentication", async () => {
        const response = await request(app)
            .post("/shows")
            .send({
                movieId: "movie-id",
                screenId: "screen-id",
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 3600000).toISOString(),
                price: "200",
            });

        expect(response.status).toBe(401);
    });
    it("should reject invalid show data", async () => {
        const token = await getAuthToken();

        const response = await request(app)
            .post("/shows")
            .set("Authorization", `Bearer ${token}`)
            .send({
                movieId: "",
                screenId: "",
                startTime: "invalid-date",
                endTime: "invalid-date",
                price: "-100",
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid show data");
    });
    it("should reject a show with invalid time range", async () => {
        const setup = await createShowTestSetup();

        const startTime = new Date(Date.now() + 86400000);
        const endTime = new Date(startTime.getTime() - 3600000);

        const response = await request(app)
            .post("/shows")
            .set("Authorization", `Bearer ${setup.token}`)
            .send({
                movieId: setup.movieId,
                screenId: setup.screenId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                price: "200",
            });

        expect(response.status).toBe(400);
    });
    it("should create and retrieve a show", async () => {
        const setup = await createShowTestSetup();

        const getResponse = await request(app)
            .get(`/shows/${setup.showId}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.show.id).toBe(setup.showId);
        expect(getResponse.body.show.movie.id).toBe(setup.movieId);
        expect(getResponse.body.show.screen.id).toBe(setup.screenId);
    });
    it("should reject overlapping shows on the same screen", async () => {
        const setup = await createShowTestSetup();

        const response = await request(app)
            .post("/shows")
            .set("Authorization", `Bearer ${setup.token}`)
            .send(setup.showData);

        expect(response.status).toBe(409);
        expect(response.body.message)
            .toBe("This screen already has a show during that time");
    });
    it("should reject booking without authentication", async () => {
        const response = await request(app)
            .post("/bookings")
            .send({
                showId: "some-show-id",
                seatIds: ["seat-1"],
            });

        expect(response.status).toBe(401);
    });
    it("should reject invalid booking data", async () => {
        const setup = await createShowTestSetup();

        const response = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${setup.token}`)
            .send({
                showId: setup.showId,
                seatIds: [],
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid booking data");
    });
    it("should reject duplicate seat IDs in a booking", async () => {
        const setup = await createShowTestSetup();

        const response = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${setup.token}`)
            .send({
                showId: setup.showId,
                seatIds: [setup.seat1Id, setup.seat1Id],
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid booking data");
    });
    it("should reject booking for a nonexistent show", async () => {
        const token = await getAuthToken();

        const response = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                showId: "nonexistent-show-id",
                seatIds: ["some-seat-id"],
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Show not found");
    });
    it("should reject booking a seat from another screen", async () => {
        const setup = await createShowTestSetup();

        const response = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${setup.token}`)
            .send({
                showId: setup.showId,
                seatIds: [setup.foreignSeatId],
            });

        expect(response.status).toBe(409);
        expect(response.body.message)
            .toBe("One or more seats do not belong to this show's screen");
    });
    it("should create a booking and calculate the correct total", async () => {
        const setup = await createShowTestSetup();

        const response = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${setup.token}`)
            .send({
                showId: setup.showId,
                seatIds: [setup.seat1Id, setup.seat2Id],
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Booking successful");

        expect(Number(response.body.booking.total)).toBe(501);

        expect(response.body.booking.seats.length).toBe(2);
        expect(response.body.booking.status).toBe("CONFIRMED");
    });
    it("should retrieve booking history and booking details", async () => {
        const setup = await createShowTestSetup();

        const bookingResponse = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${setup.token}`)
            .send({
                showId: setup.showId,
                seatIds: [setup.seat1Id],
            });

        expect(bookingResponse.status).toBe(201);

        const bookingId = bookingResponse.body.booking.id;

        // Booking history
        const historyResponse = await request(app)
            .get("/bookings")
            .set("Authorization", `Bearer ${setup.token}`);

        expect(historyResponse.status).toBe(200);
        expect(
            historyResponse.body.bookings.some(
                booking => booking.id === bookingId
            )
        ).toBe(true);

        // Individual booking
        const detailResponse = await request(app)
            .get(`/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${setup.token}`);

        expect(detailResponse.status).toBe(200);
        expect(detailResponse.body.booking.id).toBe(bookingId);
    });
    it("should reject booking a seat that is already booked", async () => {
        const setup = await createShowTestSetup();

        const firstResponse = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${setup.token}`)
            .send({
                showId: setup.showId,
                seatIds: [setup.seat1Id],
            });

        expect(firstResponse.status).toBe(201);

        // A different user attempts to book the same seat
        const secondToken = await getAuthToken();

        const secondResponse = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${secondToken}`)
            .send({
                showId: setup.showId,
                seatIds: [setup.seat1Id],
            });

        expect(secondResponse.status).toBe(409);
        expect(secondResponse.body.message)
            .toBe("One or more selected seats are already booked");
    });
    it("should cancel a booking and release its seats", async () => {
        const setup = await createShowTestSetup();

        const bookingResponse = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${setup.token}`)
            .send({
                showId: setup.showId,
                seatIds: [setup.seat1Id],
            });

        expect(bookingResponse.status).toBe(201);

        const bookingId = bookingResponse.body.booking.id;

        // Cancel booking
        const cancelResponse = await request(app)
            .patch(`/bookings/${bookingId}/cancel`)
            .set("Authorization", `Bearer ${setup.token}`);

        expect(cancelResponse.status).toBe(200);
        expect(cancelResponse.body.message)
            .toBe("Booking cancelled successfully");

        // Book the same seat again
        const secondBookingResponse = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${setup.token}`)
            .send({
                showId: setup.showId,
                seatIds: [setup.seat1Id],
            });

        expect(secondBookingResponse.status).toBe(201);
    });
    it("should reject cancellation of an already-cancelled booking", async () => {
        const setup = await createShowTestSetup();

        const bookingResponse = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${setup.token}`)
            .send({
                showId: setup.showId,
                seatIds: [setup.seat1Id],
            });

        const bookingId = bookingResponse.body.booking.id;

        await request(app)
            .patch(`/bookings/${bookingId}/cancel`)
            .set("Authorization", `Bearer ${setup.token}`);

        const secondCancelResponse = await request(app)
            .patch(`/bookings/${bookingId}/cancel`)
            .set("Authorization", `Bearer ${setup.token}`);

        expect(secondCancelResponse.status).toBe(409);
        expect(secondCancelResponse.body.message)
            .toBe("Booking is already cancelled");
    });
    it("should prevent users from accessing or cancelling another user's booking", async () => {
        const setup = await createShowTestSetup();

        const bookingResponse = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${setup.token}`)
            .send({
                showId: setup.showId,
                seatIds: [setup.seat1Id],
            });

        const bookingId = bookingResponse.body.booking.id;

        const otherUserToken = await getAuthToken();

        // Try to retrieve another user's booking
        const getResponse = await request(app)
            .get(`/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${otherUserToken}`);

        expect(getResponse.status).toBe(404);

        // Try to cancel another user's booking
        const cancelResponse = await request(app)
            .patch(`/bookings/${bookingId}/cancel`)
            .set("Authorization", `Bearer ${otherUserToken}`);

        expect(cancelResponse.status).toBe(404);
    });

    it("should prevent two users from booking the same seat simultaneously", async () => {
        // Create a show with available seats and the first user
        const setup = await createShowTestSetup();

        // Create a second user
        const secondUserToken = await getAuthToken();

        // Both users attempt to book the SAME seat at the same time
        const [firstResponse, secondResponse] = await Promise.all([
            request(app)
                .post("/bookings")
                .set("Authorization", `Bearer ${setup.token}`)
                .send({
                    showId: setup.showId,
                    seatIds: [setup.seat1Id],
                }),

            request(app)
                .post("/bookings")
                .set("Authorization", `Bearer ${secondUserToken}`)
                .send({
                    showId: setup.showId,
                    seatIds: [setup.seat1Id],
                }),
        ]);

        // Exactly one request should succeed
        const statuses = [
            firstResponse.status,
            secondResponse.status,
        ];

        expect(statuses.filter(status => status === 201)).toHaveLength(1);
        expect(statuses.filter(status => status === 409)).toHaveLength(1);
    });
});