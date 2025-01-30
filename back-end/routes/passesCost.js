const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config"); // Σύνδεση με MySQL

// GET /passesCost/:tollOpID/:tagOpID/:date_from/:date_to
router.get("/passesCost/:tollOpID/:tagOpID/:date_from/:date_to", async (req, res) => {
    const { tollOpID, tagOpID, date_from, date_to } = req.params;
    const requestTimestamp = new Date().toISOString(); // Χρόνος που έγινε το request

    // Μετατροπή ημερομηνιών σε μορφή YYYY-MM-DD HH:MM:SS
    const startDate = `${date_from.substring(0,4)}-${date_from.substring(4,6)}-${date_from.substring(6,8)} 00:00:00`;
    const endDate = `${date_to.substring(0,4)}-${date_to.substring(4,6)}-${date_to.substring(6,8)} 23:59:59`;

    try {
        const [results] = await pool.query(
            `SELECT COUNT(*) AS nPasses, SUM(p.charge) AS passesCost
             FROM passes p
             JOIN tollstations t ON p.station_id = t.station_id
             JOIN vehicletags v ON p.tag_id = v.tag_id
             WHERE t.company_id = ? 
             AND v.company_id = ? 
             AND p.timestamp BETWEEN ? AND ?`,
            [tollOpID, tagOpID, startDate, endDate]
        );

        if (!results || results.length === 0 || results[0].nPasses === 0) {
            return res.status(204).send(); // No Content
        }

        // Σύνθεση της τελικής απάντησης
        const response = {
            tollOpID: tollOpID,
            tagOpID: tagOpID,
            requestTimestamp: requestTimestamp,
            periodFrom: startDate,
            periodTo: endDate,
            nPasses: results[0].nPasses,
            passesCost: results[0].passesCost || 0.0
        };

        res.json(response);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

module.exports = router;
