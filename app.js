var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, "build")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// Catch-all handler to serve index.html for any route not handled by the API
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

module.exports = app;
