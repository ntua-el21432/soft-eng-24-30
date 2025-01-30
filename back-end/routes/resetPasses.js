const express = require("express"); // ✅ Προσθήκη του Express
const router = express.Router();
const pool = require("../utils/db.config");
const fs = require("fs");
const csv = require("csv-parser");

// POST /admin/resetpasses
router.post("/admin/resetpasses", async (req, res) => {
    try {
        console.log("🔄 Starting reset of passes and related data...");

        // **1. Διαγραφή δεδομένων από πίνακες**
        await pool.query("DELETE FROM passes");
        await pool.query("DELETE FROM vehicletags");

        // **2. Επαναφορά του auto-increment**
        await pool.query("ALTER TABLE passes AUTO_INCREMENT = 1");
        await pool.query("ALTER TABLE vehicletags AUTO_INCREMENT = 1");

        console.log("✅ All pass data and tags deleted. Now importing new data...");

        // **3. Εισαγωγή δεδομένων από passes-sample.csv**
        const insertPassesPromises = [];
        fs.createReadStream("passes-sample.csv")
            .pipe(csv({
                separator: ",",
                mapHeaders: ({ header, index }) => {
                    const headersMap = {
                        0: "timestamp",
                        1: "station_id",
                        2: "tag_id",
                        3: "company_id",
                        4: "charge"
                    };
                    return headersMap[index] || null;
                }
            }))
            .on("data", (row) => {
                const timestamp = row["timestamp"]?.trim();
                const station_id = row["station_id"]?.trim();
                const tag_id = row["tag_id"]?.trim();
                const company_id = row["company_id"]?.trim().toUpperCase();
                const charge = parseFloat(row["charge"]) || 0.00;

                if (!timestamp || !station_id || !tag_id || !company_id) {
                    console.warn(`Skipping row - Missing required fields: ${JSON.stringify(row)}`);
                    return;
                }

                // Εισαγωγή tag στον πίνακα vehicletags (αν δεν υπάρχει)
                const tagQuery = `
                    INSERT INTO vehicletags (tag_id, company_id)
                    VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE company_id = VALUES(company_id)
                `;
                insertPassesPromises.push(pool.query(tagQuery, [tag_id, company_id]));

                // Εισαγωγή διελεύσεων στον πίνακα passes
                const passQuery = `
                    INSERT INTO passes (station_id, tag_id, timestamp, charge, pass_type)
                    VALUES (?, ?, ?, ?, ?)
                `;

                // Καθορισμός pass_type
                const passTypeQuery = `
                    SELECT s.company_id AS station_company
                    FROM tollstations s WHERE s.station_id = ?
                `;

                insertPassesPromises.push(
                    pool.query(passTypeQuery, [station_id]).then(([results]) => {
                        if (results.length === 0) {
                            console.warn(`Skipping row - No station found for station_id: ${station_id}`);
                            return;
                        }
                        const station_company = results[0].station_company;
                        const pass_type = station_company === company_id ? "home" : "visitor";

                        return pool.query(passQuery, [station_id, tag_id, timestamp, charge, pass_type]);
                    })
                );
            })
            .on("end", async () => {
                try {
                    await Promise.all(insertPassesPromises);
                    console.log("✅ Import completed successfully.");
                    res.json({ status: "OK" });
                } catch (err) {
                    console.error("❌ Insert error:", err.message);
                    res.status(500).json({ status: "failed", info: "Error inserting passes" });
                }
            });

    } catch (err) {
        console.error("❌ Reset error:", err.message);
        res.status(500).json({ status: "failed", info: err.message });
    }
});

module.exports = router;
