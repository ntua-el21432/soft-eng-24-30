const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config");
const { Parser } = require("json2csv");

// GET /netCharges/:tollOpID1?/:tollOpID2?/:date_from?/:date_to?
router.get("/netCharges/:tollOpID1?/:tollOpID2?/:date_from?/:date_to?", async (req, res) => {
    const { tollOpID1, tollOpID2, date_from, date_to } = req.params;
    const { format } = req.query;
    const requestTimestamp = new Date().toISOString();

    // 🛑 Validate input: If any parameter is missing, return 400 Bad Request
    if (!tollOpID1 || !tollOpID2 || !date_from || !date_to) {
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
        // Calculate charges owed by `tollOpID2` to `tollOpID1`
        const [resultOp2] = await pool.query(
            `SELECT SUM(p.charge) AS passesCostOpID2
             FROM passes p
             JOIN tollstations t ON p.station_id = t.station_id
             JOIN vehicletags v ON p.tag_id = v.tag_id
             WHERE t.company_id = ? 
             AND v.company_id = ? 
             AND p.timestamp BETWEEN ? AND ?`,
            [tollOpID1, tollOpID2, startDate, endDate]
        );

        // Calculate charges owed by `tollOpID1` to `tollOpID2`
        const [resultOp1] = await pool.query(
            `SELECT SUM(p.charge) AS passesCostOpID1
             FROM passes p
             JOIN tollstations t ON p.station_id = t.station_id
             JOIN vehicletags v ON p.tag_id = v.tag_id
             WHERE t.company_id = ? 
             AND v.company_id = ? 
             AND p.timestamp BETWEEN ? AND ?`,
            [tollOpID2, tollOpID1, startDate, endDate]
        );

        const passesCostOpID2 = resultOp2[0]?.passesCostOpID2 || 0.0;
        const passesCostOpID1 = resultOp1[0]?.passesCostOpID1 || 0.0;
        const netCharges = parseFloat((passesCostOpID2 - passesCostOpID1).toFixed(2));

        // ✅ 204 No Content if no transactions are found
        if (passesCostOpID2 === 0 && passesCostOpID1 === 0) {
            return res.status(204).send();
        }

        // ✅ 200 Success - Build response
        const response = {
            tollOpID1: tollOpID1,
            tollOpID2: tollOpID2,
            requestTimestamp: requestTimestamp,
            periodFrom: startDate,
            periodTo: endDate,
            passesCostOpID2: passesCostOpID2,
            passesCostOpID1: passesCostOpID1,
            netCharges: netCharges
        };

        // 📄 CSV Format Handling
        if (format === "csv") {
            const csvFields = ["tollOpID1", "tollOpID2", "requestTimestamp", "periodFrom", "periodTo", "passesCostOpID2", "passesCostOpID1", "netCharges"];
            const json2csvParser = new Parser({ fields: csvFields });
            const csvData = json2csvParser.parse([response]);

            res.header("Content-Type", "text/csv");
            res.attachment(`netCharges_${tollOpID1}_${tollOpID2}_${date_from}_${date_to}.csv`);
            return res.send(csvData);
        }

        res.json(response);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

module.exports = router;