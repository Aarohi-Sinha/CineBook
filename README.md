# CineBook 🎬

A movie ticket booking backend built with **Node.js, Express.js, PostgreSQL, and Prisma ORM**.

CineBook provides RESTful APIs for managing movies, theatres, screens, seats, shows, and bookings, with JWT-based authentication and transactional seat booking.

## Features

- **User Authentication:** Registration and login with bcrypt password hashing and JWT-based authentication.
- **Movie Management:** Create, retrieve, update, and delete movies.
- **Theatre Management:** Manage theatres and their details.
- **Screen Management:** Create and retrieve screens associated with theatres.
- **Seat Management:** Manage individual seats within screens.
- **Show Scheduling:** Create and retrieve movie shows with scheduling conflict validation.
- **Ticket Booking:** Book multiple seats for a particular show.
- **Booking History:** Retrieve user-specific booking history and individual booking details.
- **Booking Cancellation:** Cancel bookings and release seats for future bookings.
- **Seat Availability:** Transactional seat claiming to prevent double booking.
- **Input Validation:** Request validation using Zod.
- **Automated Testing:** API testing using Vitest and Supertest.

## Tech Stack

- **Runtime:** Node.js
- **Backend Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT)
- **Password Security:** bcrypt
- **Validation:** Zod
- **Testing:** Vitest, Supertest
- **API Testing:** Postman
- **Version Control:** Git and GitHub

## Project Structure

```text
CineBook/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── app.js
│   └── server.js
├── tests/
│   ├── app.test.js
│   └── setup.js
├── .env.example
├── .gitignore
├── package.json
├── prisma.config.ts
└── vitest.config.js
```

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Aarohi-Sinha/CineBook.git
cd CineBook
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
copy .env.example .env
```

Replace the database username and password with your PostgreSQL credentials.

Use a strong, private JWT secret.

### 4. Configure the database

Create a PostgreSQL database named `cinebook`.

```sql
CREATE DATABASE cinebook;
```

Apply the Prisma migrations:

```bash
npx prisma migrate deploy
```

Generate the Prisma Client if required:

```bash
npx prisma generate
```

### 5. Start the development server

```bash
npm run dev
```

The server runs at:

```text
http://localhost:3002
```

## API Documentation

All endpoints accept and return JSON unless otherwise specified.

### Authentication

- `POST /auth/register` – Register a new user.
- `POST /auth/login` – Authenticate a user and receive an access token.
- `GET /auth/profile` – Retrieve the authenticated user's profile.

### Movies

- `GET /movies` – Retrieve all movies.
- `GET /movies/:id` – Retrieve a movie by ID.
- `POST /movies` – Create a movie.
- `PATCH /movies/:id` – Update a movie.
- `DELETE /movies/:id` – Delete a movie.

### Theatres

- `GET /theatres` – Retrieve all theatres.
- `GET /theatres/:id` – Retrieve a theatre by ID.
- `POST /theatres` – Create a theatre.

### Screens

- `GET /screens` – Retrieve all screens.
- `GET /screens/:id` – Retrieve a screen by ID.
- `POST /screens` – Create a screen.

### Seats

- `GET /seats` – Retrieve seats.
- `GET /seats/screen/:screenId` – Retrieve seats belonging to a screen.
- `POST /seats` – Create a seat.

### Shows

- `GET /shows` – Retrieve all shows.
- `GET /shows/:id` – Retrieve a show by ID.
- `POST /shows` – Create a show.

### Bookings

- `POST /bookings` – Create a booking.
- `GET /bookings` – Retrieve the authenticated user's bookings.
- `GET /bookings/:id` – Retrieve booking details.
- `PATCH /bookings/:id/cancel` – Cancel a booking.

### Authentication Header

Protected endpoints require a JWT access token in the request header:

```http
Authorization: Bearer <access_token>
```

## Testing

CineBook uses **Vitest** and **Supertest** for automated API testing.

A separate PostgreSQL database is used for tests to prevent test operations from affecting application development data.

### Test Database Setup

Create a separate PostgreSQL database:

```sql
CREATE DATABASE cinebook_test;
```

Create a `.env.test` file:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/cinebook_test"
JWT_SECRET="test_secret"
```

Apply Prisma migrations to the test database:

```bash
npx dotenv -e .env.test -- npx prisma migrate deploy
```

### Run Automated Tests

```bash
npm test
```

The test setup automatically clears test records before each test and checks that the configured database is `cinebook_test`.

**Current test results: 47 passing automated tests.**

Tests cover authentication, resource management, show scheduling, booking, authorization, concurrent seat booking, and cancellation.

## Security and Data Integrity

- Passwords are hashed using bcrypt before being stored.
- JWT access tokens expire after 15 minutes.
- Protected routes use authentication middleware.
- User-specific booking queries enforce booking ownership.
- Zod validates incoming request data.
- Prisma manages relational database operations.
- Database constraints enforce unique emails, screen names within theatres, seat positions, and show-seat combinations.
- Database transactions are used for booking and cancellation workflows.

## Future Improvements

- Payment gateway integration.
- Refresh token mechanism.
- Role-based access control for administrative operations.
- Frontend movie browsing and ticket booking interface.
- Deployment and monitoring.

## License

This project is developed for learning and portfolio purposes.