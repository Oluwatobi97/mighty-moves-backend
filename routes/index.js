const express = require("express");
const router = express.Router();
const pool = require("../db");

// Health check endpoint
router.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// Example route: Get all items
router.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items"); // Change 'items' to your actual table name if needed
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res
      .status(500)
      .json({ error: "Database connection failed", details: err.message });
  }
});

module.exports = router;
