const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config"); // Database connection

// ✅ GET /api/tollstations - Fetch all toll stations
router.get("/stations", async (req, res) => {
    try {
        const [stations] = await pool.query(
            "SELECT station_id, station_name FROM tollstations ORDER BY station_name"
        );

        if (stations.length === 0) {
            return res.status(204).send(); // No stations found
        }

        res.status(200).json(stations);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

module.exports = router;