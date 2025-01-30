const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config"); // Σύνδεση με MySQL
const fs = require("fs");
const csv = require("csv-parser");

// POST /admin/resetstations
router.post("/admin/resetStations", async (req, res) => {
    const filePath = "tollstations2024.csv"; // Αρχείο CSV

    try {
        // **1. Διαγραφή όλων των δεδομένων από τον πίνακα tollstations**
        await pool.query("TRUNCATE TABLE tollstations");
        console.log("✅ Table 'tollstations' truncated successfully.");

        // **2. Διαβάζουμε το CSV και εισάγουμε τα δεδομένα**
        const results = [];


        
        fs.createReadStream(filePath)
            .pipe(csv({
                separator: ",",
                mapHeaders: ({ header, index }) => {
                    const headersMap = {
                        0: "company_id",
                        2: "station_id",
                        3: "station_name",
                        4: "position_marker",
                        5: "locality",
                        6: "road",
                        7: "latitude",
                        8: "longitude",
                        9: "email",
                        10: "price1",
                        11: "price2",
                        12: "price3",
                        13: "price4"
                    };
                    return headersMap[index] || null;
                }
            }))
            .on("data", async (row) => {
                const company_id = row["company_id"]?.trim().toUpperCase();
                const station_id = row["station_id"]?.trim().toUpperCase();
                const station_name = row["station_name"]?.trim();
                const position_marker = row["position_marker"]?.trim().toUpperCase();

                if (!company_id || !station_id || !station_name) {
                    console.warn(`Skipping row - Missing data: ${row}`);
                    return;
                }

                const locality = row["locality"]?.trim();
                const road = row["road"]?.trim();
                const latitude = parseFloat(row["latitude"]) || null;
                const longitude = parseFloat(row["longitude"]) || null;
                const email = row["email"]?.trim();
                const price1 = parseFloat(row["price1"]) || 0.00;
                const price2 = parseFloat(row["price2"]) || 0.00;
                const price3 = parseFloat(row["price3"]) || 0.00;
                const price4 = parseFloat(row["price4"]) || 0.00;

                results.push([station_id, company_id, station_name, position_marker, locality, road, latitude, longitude, email, price1, price2, price3, price4]);
            })
            .on("end", async () => {
                if (results.length === 0) {
                    return res.status(400).json({ status: "failed", info: "CSV file is empty or contains invalid data." });
                }

                // **3. Εισαγωγή δεδομένων στη βάση**
                const query = `
                    INSERT INTO tollstations (station_id, company_id, station_name, position_marker, locality, road, latitude, longitude, email, price1, price2, price3, price4)
                    VALUES ?
                `;

                try {
                    await pool.query(query, [results]);
                    console.log("Data inserted successfully.");
                    res.json({ status: "OK" });
                } catch (insertErr) {
                    console.error("Insert error:", insertErr);
                    res.status(500).json({ status: "failed", info: "Database insert error." });
                }
            });
    } catch (err) {
        console.error("Reset error:", err);
        res.status(500).json({ status: "failed", info: "Error processing resetstations." });
    }
});

module.exports = router;
