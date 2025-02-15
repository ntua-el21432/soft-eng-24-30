const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config");

// GET /api/operators
router.get("/operators", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT company_id, company_name FROM tollcompanies");
    res.json(results); // Return the operator data as JSON
  } catch (err) {
    console.error("Error fetching operators:", err);
    res.status(500).json({ error: "Failed to fetch operators" });
  }
});

module.exports = router;
