const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

// ✅ Routes
const indexRouter = require("./server/routes/index");
const usersRouter = require("./server/routes/users");
const bookingsRouter = require("./server/routes/bookings");

const app = express();

// ✅ CORS configuration for frontend access
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ✅ Middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ✅ API Routes
app.use("/api", indexRouter); // Example: /api/
app.use("/api/users", usersRouter); // Example: /api/users/register
app.use("/api/bookings", bookingsRouter); // Example: /api/bookings/

// ✅ Serve static frontend (React) in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));

  // ✅ Catch-all: serve index.html on unmatched routes (SPA fallback)
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

module.exports = app;
