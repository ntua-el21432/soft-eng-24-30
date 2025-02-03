const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config"); // Σύνδεση με MySQL
const { Parser } = require("json2csv"); // Βιβλιοθήκη για εξαγωγή CSV

// GET /chargesBy/:tollOpID/:date_from/:date_to
router.get("/chargesBy/:tollOpID/:date_from/:date_to", async (req, res) => {
    const { tollOpID, date_from, date_to } = req.params;
    const { format } = req.query; // Λήψη του format από τα query parameters
    const requestTimestamp = new Date().toISOString(); // Χρόνος που έγινε το request

    // Μετατροπή ημερομηνιών σε μορφή YYYY-MM-DD HH:MM:SS
    const startDate = `${date_from.substring(0,4)}-${date_from.substring(4,6)}-${date_from.substring(6,8)} 00:00:00`;
    const endDate = `${date_to.substring(0,4)}-${date_to.substring(4,6)}-${date_to.substring(6,8)} 23:59:59`;

    try {
        const [results] = await pool.query(
            `SELECT v.company_id AS visitingOpID, 
                    COUNT(*) AS nPasses, 
                    SUM(p.charge) AS passesCost
             FROM passes p
             JOIN tollstations t ON p.station_id = t.station_id
             JOIN vehicletags v ON p.tag_id = v.tag_id
             WHERE t.company_id = ? 
             AND t.company_id <> v.company_id  -- Εξασφαλίζουμε ότι το tag ανήκει σε διαφορετικό operator
             AND p.timestamp BETWEEN ? AND ?
             GROUP BY v.company_id`,
            [tollOpID, startDate, endDate]
        );

        if (!results || results.length === 0) {
            return res.status(204).send(); // No Content
        }

        // Σύνθεση της τελικής απάντησης
        const response = {
            tollOpID: tollOpID,
            requestTimestamp: requestTimestamp,
            periodFrom: startDate,
            periodTo: endDate,
            vOpList: results.map(row => ({
                visitingOpID: row.visitingOpID,
                nPasses: row.nPasses,
                passesCost: row.passesCost || 0.0
            }))
        };

        // Έλεγχος για τον τύπο επιστροφής (JSON ή CSV)
        if (format === "csv") {
            const csvFields = ["visitingOpID", "nPasses", "passesCost"];
            const json2csvParser = new Parser({ fields: csvFields });
            const csvData = json2csvParser.parse(response.vOpList);

            res.header("Content-Type", "text/csv");
            res.attachment(`chargesBy_${tollOpID}_${date_from}_${date_to}.csv`);
            return res.send(csvData);
        } else {
            // Default JSON
            res.json(response);
        }
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

module.exports = router;
