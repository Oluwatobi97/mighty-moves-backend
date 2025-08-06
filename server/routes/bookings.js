const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../../db");

const router = express.Router();

/* ------------------ 🔒 JWT Authentication Middleware ------------------ */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

/* ------------------ 🔢 Tracking ID Generator ------------------ */
function generateTrackingId() {
  const prefix = "MM";
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${randomPart}-${timestamp}`;
}

/* ------------------ 📦 Create Booking ------------------ */
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
        ($1, $2, $3, $4, 'Pending', $5, $6, NOW()) 
       RETURNING *`,
      [req.user.id, service_type, address, date, price, details || {}]
    );

    res.status(201).json({ booking: result.rows[0] });
  } catch (err) {
    console.error("❌ Booking creation error:", err.message);
    res
      .status(500)
      .json({ error: "Booking creation failed", details: err.message });
  }
});

/* ------------------ ✅ Approve Booking ------------------ */
router.patch("/:id/approve", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const trackingId = generateTrackingId();

  try {
    const result = await pool.query(
      `UPDATE bookings 
       SET status = 'In Progress', tracking_id = $1 
       WHERE id = $2 AND status = 'Pending' 
       RETURNING *`,
      [trackingId, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Booking not found or already approved." });
    }

    res.json({ booking: result.rows[0] });
  } catch (err) {
    console.error("❌ Booking approval error:", err.message);
    res.status(500).json({ error: "Approval failed", details: err.message });
  }
});

/* ------------------ 📍 Update Location ------------------ */
router.post("/location/:trackingId", authenticateToken, async (req, res) => {
  const { trackingId } = req.params;
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required." });
  }

  try {
    const result = await pool.query(
      `UPDATE bookings 
       SET location = $1 
       WHERE tracking_id = $2 
       RETURNING id, tracking_id, location`,
      [JSON.stringify({ lat, lng }), trackingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tracking ID not found." });
    }

    res.json({ success: true, location: result.rows[0].location });
  } catch (err) {
    console.error("❌ Location update error:", err.message);
    res
      .status(500)
      .json({ error: "Location update failed", details: err.message });
  }
});

/* ------------------ 🔎 Public Tracking ------------------ */
router.get("/track/:trackingId", async (req, res) => {
  const { trackingId } = req.params;

  try {
    const result = await pool.query(
      `SELECT location FROM bookings WHERE tracking_id = $1`,
      [trackingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tracking ID not found." });
    }

    res.json({ location: result.rows[0].location });
  } catch (err) {
    console.error("❌ Fetch tracking error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch location", details: err.message });
  }
});

/* ------------------ 📋 Admin: All Bookings ------------------ */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bookings ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Fetch all bookings error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ 👤 User Bookings ------------------ */
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Fetch user bookings error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
