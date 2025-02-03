const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config");
const fs = require("fs");
const csv = require("csv-parser");
const { Parser } = require("json2csv"); // Για μετατροπή JSON σε CSV

router.post("/admin/addpasses", async (req, res) => {
    try {
        console.log("🚀 Starting import of passes data...");

        // **1. Έλεγχος αν υπάρχει το CSV αρχείο**
        const filePath = "passes-sample.csv";
        if (!fs.existsSync(filePath)) {
            console.error("❌ CSV file not found.");
            return res.status(400).json({ status: "failed", info: "CSV file not found." });
        }

        // **2. Εισαγωγή δεδομένων από passes-sample.csv**
        const insertPassesPromises = [];
        const passesData = [];

        fs.createReadStream(filePath)
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
                    console.warn(`⚠️ Skipping row - Missing required fields: ${JSON.stringify(row)}`);
                    return;
                }

                // Αποθήκευση των δεδομένων για επιλογή μορφοτύπου
                passesData.push({
                    timestamp,
                    station_id,
                    tag_id,
                    company_id,
                    charge
                });

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
                            console.warn(`⚠️ Skipping row - No station found for station_id: ${station_id}`);
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

                    // **Έλεγχος μορφοτύπου από το query parameter**
                    const format = req.query.format || "json";

                    if (format === "csv") {
                        const json2csvParser = new Parser();
                        const csvData = json2csvParser.parse(passesData);
                        res.header("Content-Type", "text/csv");
                        res.attachment("passes-data.csv");
                        return res.send(csvData);
                    }

                    // Default επιστροφή σε JSON
                    res.json({ status: "OK", message: "Passes imported successfully.", data: passesData });

                } catch (err) {
                    console.error("❌ Insert error:", err.message);
                    res.status(500).json({ status: "failed", info: "Error inserting passes" });
                }
            });

    } catch (err) {
        console.error("❌ Import error:", err.message);
        res.status(500).json({ status: "failed", info: err.message });
    }
});

module.exports = router;
