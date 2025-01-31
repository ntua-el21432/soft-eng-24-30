const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config");
const fs = require("fs");
const csv = require("csv-parser");

router.post("/admin/resetstations", async (req, res) => {
    try {
        console.log("🔄 Starting full reset of toll system...");

        // **1. Διαγραφή δεδομένων με τη σωστή σειρά**
        await pool.query("DELETE FROM passes");
        await pool.query("DELETE FROM vehicletags");
        await pool.query("DELETE FROM tollstations");
        await pool.query("DELETE FROM tollcompanies");

        // **2. Επαναφορά Auto Increment**
        await pool.query("ALTER TABLE passes AUTO_INCREMENT = 1");
        await pool.query("ALTER TABLE vehicletags AUTO_INCREMENT = 1");
        await pool.query("ALTER TABLE tollstations AUTO_INCREMENT = 1");
        await pool.query("ALTER TABLE tollcompanies AUTO_INCREMENT = 1");

        console.log("✅ Deleted all records from tables.");

        // **3. Εισαγωγή νέων δεδομένων**
        console.log("🚀 Importing companies...");
        await importTollCompanies();

        console.log("🚀 Importing toll stations...");
        await importTollStations();

        console.log("✅ Reset process completed successfully.");
        res.json({ status: "OK" });

    } catch (err) {
        console.error("❌ Reset error:", err.message);
        res.status(500).json({ status: "failed", info: err.message });
    }
});

module.exports = router;

// **Εισαγωγή δεδομένων σε tollcompanies**
async function importTollCompanies() {
    return new Promise((resolve, reject) => {
        const companies = new Map();

        fs.createReadStream("tollstations2024.csv")
            .pipe(csv({
                separator: ",",
                mapHeaders: ({ header, index }) => {
                    const headersMap = { 0: "company_id", 1: "company_name" };
                    return headersMap[index] || null;
                }
            }))
            .on("data", (row) => {
                const company_id = row["company_id"]?.trim().toUpperCase();
                const company_name = row["company_name"]?.trim();

                if (!company_id || !company_name) {
                    console.warn(`⚠️ Skipping company row - Missing data: ${JSON.stringify(row)}`);
                    return;
                }

                if (!companies.has(company_id)) {
                    companies.set(company_id, company_name);
                }
            })
            .on("end", async () => {
                try {
                    const query = `
                        INSERT INTO tollcompanies (company_id, company_name) 
                        VALUES (?, ?) 
                        ON DUPLICATE KEY UPDATE company_name = VALUES(company_name)
                    `;

                    const insertPromises = [];
                    companies.forEach((company_name, company_id) => {
                        insertPromises.push(pool.query(query, [company_id, company_name]));
                    });

                    await Promise.all(insertPromises);
                    console.log(`✅ Imported ${companies.size} companies.`);
                    resolve();
                } catch (err) {
                    console.error("❌ Insert error (tollcompanies):", err.message);
                    reject(err);
                }
            });
    });
}

// **Εισαγωγή δεδομένων σε tollstations**
async function importTollStations() {
    return new Promise((resolve, reject) => {
        const stations = [];

        fs.createReadStream("tollstations2024.csv")
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
            .on("data", (row) => {
                const company_id = row["company_id"]?.trim().toUpperCase();
                const station_id = row["station_id"]?.trim().toUpperCase();
                const station_name = row["station_name"]?.trim();
                const position_marker = row["position_marker"]?.trim().toUpperCase();
                const locality = row["locality"]?.trim();
                const road = row["road"]?.trim();
                const latitude = parseFloat(row["latitude"]) || null;
                const longitude = parseFloat(row["longitude"]) || null;
                const email = row["email"]?.trim();
                const price1 = parseFloat(row["price1"]) || 0.00;
                const price2 = parseFloat(row["price2"]) || 0.00;
                const price3 = parseFloat(row["price3"]) || 0.00;
                const price4 = parseFloat(row["price4"]) || 0.00;

                if (!company_id || !station_id || !station_name) {
                    console.warn(`⚠️ Skipping station row - Missing data: ${JSON.stringify(row)}`);
                    return;
                }

                stations.push([station_id, company_id, station_name, position_marker, locality, road, latitude, longitude, email, price1, price2, price3, price4]);
            })
            .on("end", async () => {
                try {
                    const query = `
                        INSERT INTO tollstations (station_id, company_id, station_name, position_marker, locality, road, latitude, longitude, email, price1, price2, price3, price4)
                        VALUES ?
                    `;

                    await pool.query(query, [stations]);
                    console.log(`✅ Imported ${stations.length} toll stations.`);
                    resolve();
                } catch (err) {
                    console.error("❌ Insert error (tollstations):", err.message);
                    reject(err);
                }
            });
    });
}

console.log("✅ resetStations.js loaded successfully.");
