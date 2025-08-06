const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

// Middleware to authenticate JWT and set req.user
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Helper function to generate a random tracking ID
function generateTrackingId() {
  const prefix = "MM"; // Mighty Moves
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestampPart = Date.now().toString().slice(-4);
  return `${prefix}-${randomPart}-${timestampPart}`;
}

// Create a new booking
router.post("/", authenticateToken, async (req, res) => {
  const { service_type, address, date, price, details } = req.body;

  if (!service_type || !address || !date || !price) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO bookings 
        (user_id, service_type, address, date, status, price, details, created_at) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING *`,
      [
        req.user.id,
        service_type,
        address,
        date,
        "Pending",
        price,
        details || {},
      ]
    );

    res.status(201).json({ booking: result.rows[0] });
  } catch (err) {
    console.error("Booking creation error:", err);
    res
      .status(500)
      .json({ error: "Booking creation failed", details: err.message });
  }
});

// Approve a booking and assign a tracking ID (admin)
router.patch("/:id/approve", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const trackingId = generateTrackingId();

  try {
    const result = await pool.query(
      "UPDATE bookings SET status = 'In Progress', tracking_id = $1 WHERE id = $2 AND status = 'Pending' RETURNING *",
      [trackingId, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Booking not found or not pending." });
    }

    res.json({ booking: result.rows[0] });
  } catch (err) {
    console.error("Booking approval error:", err);
    res
      .status(500)
      .json({ error: "Booking approval failed", details: err.message });
  }
});

// Get all bookings (admin)
router.get("/", authenticateToken, async (req, res) => {
  // For now, allow all users to get all bookings. Add admin check later.
  try {
    const result = await pool.query(
      "SELECT * FROM bookings ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookings for the logged-in user
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
