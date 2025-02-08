const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config");
const { Parser } = require("json2csv"); // Convert JSON to CSV

// GET /mapStations - Retrieve toll stations with company and location
router.get("/mapStations", async (req, res) => {
    const format = req.query.format || "json"; // Default format: JSON
    const requestTimestamp = new Date().toISOString(); // Timestamp of request

    try {
        const [results] = await pool.query(
            `SELECT station_id, company_id, latitude, longitude 
             FROM tollstations 
             ORDER BY station_id ASC`
        );

        // ✅ 204 No Content if no records found
        if (results.length === 0) {
            return res.status(204).send();
        }

        // ✅ 200 Success - Build response
        const response = results.map(row => ({
            stationID: row.station_id,
            companyID: row.company_id,
            location: { lat: parseFloat(row.latitude), lng: parseFloat(row.longitude) }
        }));

        // 📄 CSV Support
        if (format === "csv") {
            const json2csvParser = new Parser();
            const csvData = json2csvParser.parse(response);
            res.header("Content-Type", "text/csv");
            res.attachment("mapStations.csv");
            return res.send(csvData);
        }

        // Default JSON response
        res.json(response);

    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

module.exports = router;