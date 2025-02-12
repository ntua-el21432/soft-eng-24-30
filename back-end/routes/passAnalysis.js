const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config");
const { Parser } = require("json2csv");

// GET /passAnalysis/:stationOpID/:tagOpID/:date_from/:date_to
router.get("/passAnalysis/:stationOpID?/:tagOpID?/:date_from?/:date_to?", async (req, res) => {
    const { stationOpID, tagOpID, date_from, date_to } = req.params;
    const format = req.query.format || "json"; // Default format is JSON
    const requestTimestamp = new Date().toISOString();

    // 🛑 Validate input: If any parameter is missing, return 400 Bad Request
    if (!stationOpID || !tagOpID || !date_from || !date_to) {
        return res.status(400).json({ error: "Bad Request", message: "Missing required parameters." });
    }

    // 🛑 Validate date format (YYYYMMDD)
    const dateRegex = /^\d{8}$/;
    if (!dateRegex.test(date_from) || !dateRegex.test(date_to)) {
        return res.status(400).json({ error: "Bad Request", message: "Invalid date format. Use YYYYMMDD." });
    }

    // Convert dates to SQL-compatible format
    const startDate = `${date_from.substring(0, 4)}-${date_from.substring(4, 6)}-${date_from.substring(6, 8)} 00:00:00`;
    const endDate = `${date_to.substring(0, 4)}-${date_to.substring(4, 6)}-${date_to.substring(6, 8)} 23:59:59`;

    try {
        // Validate stationOpID
        const [stationOpCheck] = await pool.query(
            `SELECT company_id FROM tollstations WHERE company_id = ?`,
            [stationOpID]
        );

        // If stationOpID is invalid, return 400
        if (stationOpCheck.length === 0) {
            return res.status(400).json({ error: "Bad Parameter", message: "Station operator ID is invalid." });
        }

        const [results] = await pool.query(
            `SELECT p.pass_id, p.timestamp, p.tag_id, p.charge, 
                    p.station_id,
                    t1.company_id AS stationOperator, 
                    v.company_id AS tagOperator
             FROM passes p
             JOIN tollstations t1 ON p.station_id = t1.station_id
             JOIN vehicletags v ON p.tag_id = v.tag_id
             WHERE t1.company_id = ? 
             AND v.company_id = ? 
             AND p.timestamp BETWEEN ? AND ?
             ORDER BY p.timestamp ASC`,
            [stationOpID, tagOpID, startDate, endDate]
        );

        // ✅ 204 No Content if no records found
        if (results.length === 0) {
            return res.status(204).send();
        }

        // ✅ 200 Success - Build response
        const response = {
            stationOpID: stationOpID,
            tagOpID: tagOpID,
            requestTimestamp: requestTimestamp,
            periodFrom: startDate,
            periodTo: endDate,
            nPasses: results.length,
            passList: results.map((row, index) => ({
                passIndex: index + 1,
                passID: row.pass_id,
                stationID: row.station_id,
                timestamp: row.timestamp,
                tagID: row.tag_id,
                passCharge: row.charge
            }))
        };

        // 📄 CSV Format Handling
        if (format === "csv") {
            const fields = ["passIndex", "passID", "stationID", "timestamp", "tagID", "passCharge"];
            const opts = { fields };
            const parser = new Parser(opts);
            const csvData = parser.parse(response.passList);

            res.header("Content-Type", "text/csv");
            res.attachment("passAnalysis.csv");
            return res.send(csvData);
        }

        res.json(response);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

module.exports = router;