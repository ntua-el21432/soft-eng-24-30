const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config");
const { Parser } = require("json2csv"); // Βιβλιοθήκη για μετατροπή JSON σε CSV

// GET /tollStationPasses/:tollStationID/:date_from/:date_to
router.get("/tollStationPasses/:tollStationID/:date_from/:date_to", async (req, res) => {
    const { tollStationID, date_from, date_to } = req.params;
    const format = req.query.format || "json"; // Default format: JSON
    const requestTimestamp = new Date().toISOString();

    // Μετατροπή ημερομηνιών στη σωστή μορφή
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

        if (results.length === 0) {
            return res.status(204).send(); // No Content
        }

        // Σύνθεση της τελικής απάντησης
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

        // **Υποστήριξη CSV ή JSON**
        if (format === "csv") {
            const fields = [
                "stationID", "stationOperator", "requestTimestamp",
                "periodFrom", "periodTo", "nPasses",
                "passIndex", "passID", "timestamp", "tagID",
                "tagProvider", "passType", "passCharge"
            ];
            const csvParser = new Parser({ fields });
            const csvData = csvParser.parse(response.passList.map(pass => ({
                stationID: response.stationID,
                stationOperator: response.stationOperator,
                requestTimestamp: response.requestTimestamp,
                periodFrom: response.periodFrom,
                periodTo: response.periodTo,
                nPasses: response.nPasses,
                ...pass
            })));

            res.header("Content-Type", "text/csv");
            res.attachment(`tollStationPasses_${tollStationID}_${date_from}_${date_to}.csv`);
            return res.send(csvData);
        }

        // Default επιστροφή JSON
        res.json(response);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

module.exports = router;
