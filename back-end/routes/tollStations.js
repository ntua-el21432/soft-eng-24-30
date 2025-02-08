const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config");

// GET /tollStations - Fetch all toll stations
router.get("/tollStations", async (req, res) => {
    const dbConnectionString = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME 
    ? `mysql://${process.env.DB_USER}:${process.env.DB_PASS || ''}@${process.env.DB_HOST}/${process.env.DB_NAME}`
    : "Not Available";
    
    try {
        const [results] = await pool.query(
        `SELECT station_id AS stationID, latitude AS lat, longitude AS lng 
        FROM tollstations`
        );

        // Format the response
        const formattedResults = results.map((station) => ({
        stationID: station.stationID,
        location: {
            lat: station.lat,
            lng: station.lng,
        },
        }));

        res.status(200).json(formattedResults);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Failed to fetch toll stations. Please try again." });
    }
});module.exports = router;