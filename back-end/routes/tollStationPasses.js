const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config"); // Σύνδεση με MySQL

// GET /tollStationPasses/:tollStationID/:date_from/:date_to
router.get("/tollStationPasses/:tollStationID/:date_from/:date_to", async (req, res) => {
    const { tollStationID, date_from, date_to } = req.params;
    const requestTimestamp = new Date().toISOString(); // Χρόνος που έγινε το request

    // 🛑 Validate input: If any parameter is missing, return 400 Bad Request
    if (!tollStationID || !date_from || !date_to) {
        return res.status(400).json({ error: "Bad Request", message: "Missing required parameters." });
    }

    // Validate date format (basic check)
    const dateRegex = /^\d{8}$/;
    if (!dateRegex.test(date_from) || !dateRegex.test(date_to)) {
        return res.status(400).json({ error: "Bad Request", message: "Invalid date format. Use YYYYMMDD." });
    }

    // Placeholder for authentication (if needed in the future)
    // if (!req.user) {
    //    return res.status(401).json({ error: "Not Authorized", message: "Authentication required." });
    // }

    // Convert dates to SQL-compatible format
    const startDate = `${date_from.substring(0,4)}-${date_from.substring(4,6)}-${date_from.substring(6,8)} 00:00:00`;
    const endDate = `${date_to.substring(0,4)}-${date_to.substring(4,6)}-${date_to.substring(6,8)} 23:59:59`;

    try {
        const [results] = await pool.query(
            `SELECT p.pass_id, p.timestamp, p.tag_id, 
                    t.company_id AS stationOperator, 
                    v.company_id AS tagProvider, 
                    p.pass_type, p.charge 
             FROM passes p
             JOIN tollstations t ON p.station_id = t.station_id
             JOIN vehicletags v ON p.tag_id = v.tag_id
             WHERE p.station_id = ? 
             AND p.timestamp BETWEEN ? AND ?
             ORDER BY p.timestamp ASC`,
            [tollStationID, startDate, endDate]
        );

        // ✅ 204 No Content if no records found
        if (results.length === 0) {
            return res.status(204).send();
        }

        // ✅ 200 Success - Build response
        const response = {
            stationID: tollStationID,
            stationOperator: results[0].stationOperator || "Unknown",
            requestTimestamp: requestTimestamp,
            periodFrom: startDate,
            periodTo: endDate,
            nPasses: results.length,
            passList: results.map((row, index) => ({
                passIndex: index + 1,
                passID: row.pass_id,
                timestamp: row.timestamp,
                tagID: row.tag_id,
                tagProvider: row.tagProvider || "Unknown",
                passType: row.pass_type,
                passCharge: row.charge
            }))
        };

        res.status(200).json(response);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

module.exports = router;
