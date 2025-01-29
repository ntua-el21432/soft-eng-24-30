const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config"); // Σύνδεση με MySQL

// GET /tollStationPasses/:tollStationID/:date_from/:date_to
router.get("/tollStationPasses/:tollStationID/:date_from/:date_to", async (req, res) => {
    const { tollStationID, date_from, date_to } = req.params;
    const format = req.query.format || "json"; // Default JSON format

    // Μετατροπή ημερομηνιών σε μορφή YYYY-MM-DD για timestamp comparison
    const startDate = `${date_from.substring(0,4)}-${date_from.substring(4,6)}-${date_from.substring(6,8)} 00:00:00`;
    const endDate = `${date_to.substring(0,4)}-${date_to.substring(4,6)}-${date_to.substring(6,8)} 23:59:59`;

    try {
        const [results] = await pool.query(
            `SELECT pass_id, timestamp, tag_id, station_id, pass_type, charge 
             FROM passes 
             WHERE station_id = ? 
             AND timestamp >= ? AND timestamp <= ?
             ORDER BY timestamp ASC`,
            [tollStationID, startDate, endDate]
        );

        if (results.length === 0) {
            return res.status(204).send(); // No Content
        }

        if (format === "csv") {
            const csv = results.map(row => 
                `${row.pass_id},${row.timestamp},${row.tag_id},${row.station_id},${row.pass_type},${row.charge}`
            ).join("\n");

            res.setHeader("Content-Type", "text/csv");
            return res.send(csv);
        }

        res.json(results);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

module.exports = router;
