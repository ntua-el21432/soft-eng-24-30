const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config");
const { Parser } = require("json2csv");

// GET /chargesBy/:tollOpID?/:date_from?/:date_to?
router.get("/chargesBy/:tollOpID?/:date_from?/:date_to?", async (req, res) => {
    const { tollOpID, date_from, date_to } = req.params;
    const { format } = req.query;
    const requestTimestamp = new Date().toISOString();

    // 🛑 Validate input: If any parameter is missing, return 400 Bad Request
    if (!tollOpID || !date_from || !date_to) {
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

        const[tollOpIDcheck]=await pool.query(
            `SELECT * FROM tollcompanies WHERE company_id=?`,
            [tollOpID]
        )
        if(tollOpIDcheck.length===0){
            return res.status(400).json({ error: "Bad Request", message: "Wrong Input" });
        }

        const [results] = await pool.query(
            `SELECT v.company_id AS visitingOpID, 
                    COUNT(*) AS nPasses, 
                    SUM(p.charge) AS passesCost
             FROM passes p
             JOIN tollstations t ON p.station_id = t.station_id
             JOIN vehicletags v ON p.tag_id = v.tag_id
             WHERE t.company_id = ? 
             AND t.company_id <> v.company_id  -- Ensure tag belongs to a different operator
             AND p.timestamp BETWEEN ? AND ?
             GROUP BY v.company_id`,
            [tollOpID, startDate, endDate]
        );

        // ✅ 204 No Content if no results found
        if (!results || results.length === 0) {
            return res.status(204).send();
        }

        // ✅ 200 Success - Build response
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

        // 📄 CSV Format Handling
        if (format === "csv") {
            const csvFields = ["visitingOpID", "nPasses", "passesCost"];
            const json2csvParser = new Parser({ fields: csvFields });
            const csvData = json2csvParser.parse(response.vOpList);

            res.header("Content-Type", "text/csv");
            res.attachment(`chargesBy_${tollOpID}_${date_from}_${date_to}.csv`);
            return res.send(csvData);
        }

        res.json(response);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

module.exports = router;