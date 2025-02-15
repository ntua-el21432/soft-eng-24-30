const fs = require('fs');
const mysql = require('mysql2');
const csv = require('csv-parser');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Change if necessary
    password: '',  // Change if needed
    database: 'tollmanager'
});

// Store all insert queries to execute them in batch
const insertPromises = [];

fs.createReadStream('passes-sample.csv') // Ensure correct filename
    .pipe(csv({
        separator: ',', // Ensure correct delimiter
        mapHeaders: ({ header, index }) => {
            const headersMap = {
                0: "timestamp",
                1: "station_id", // Directly using tollID as station_id
                2: "tag_id",     // Directly using tagRef as tag_id
                4: "charge"
            };
            return headersMap[index] || null; // Ignore other columns
        }
    }))
    .on('data', (row) => {
        // Debugging: Print parsed row
        console.log("Row Data:", row);

        const timestamp = row["timestamp"]?.trim();
        const station_id = row["station_id"]?.trim();
        const tag_id = row["tag_id"]?.trim();
        const charge = parseFloat(row["charge"]) || 0.00;

        if (!timestamp || !station_id || !tag_id) {
            console.warn(`Skipping row - Missing required fields: ${row}`);
            return;
        }

        // Determine pass_type (home/visitor)
        const queryCompanyIds = `
            SELECT v.company_id AS tag_company, s.company_id AS station_company
            FROM vehicletags v
            JOIN tollstations s ON s.station_id = ?
            WHERE v.tag_id = ?
        `;

        const insertPromise = new Promise((resolve, reject) => {
            connection.query(queryCompanyIds, [station_id, tag_id], (err, results) => {
                if (err) {
                    console.error('Query error:', err);
                    reject(err);
                    return;
                }

                if (results.length === 0) {
                    console.warn(`Skipping row - No matching company data for tag_id: ${tag_id} or station_id: ${station_id}`);
                    resolve();
                    return;
                }

                const tag_company = results[0].tag_company;
                const station_company = results[0].station_company;
                const pass_type = tag_company === station_company ? 'home' : 'visitor';

                // Insert into passes table
                const insertQuery = `
                    INSERT INTO passes (station_id, tag_id, timestamp, charge, pass_type)
                    VALUES (?, ?, ?, ?, ?)
                `;

                connection.query(insertQuery, [station_id, tag_id, timestamp, charge, pass_type], (err, res) => {
                    if (err) {
                        console.error('Insert error:', err);
                        reject(err);
                    } else {
                        console.log(`Inserted pass for tag_id: ${tag_id} at station_id: ${station_id} with pass_type: ${pass_type}`);
                        resolve();
                    }
                });
            });
        });

        insertPromises.push(insertPromise);
    })
    .on('end', () => {
        console.log("CSV processing complete. Waiting for all inserts to finish...");

        // Wait for all queries to complete before closing connection
        Promise.all(insertPromises)
            .then(() => {
                console.log("All data inserted successfully. Closing connection.");
                connection.end();
            })
            .catch((err) => {
                console.error("Error occurred during insert operations:", err);
                connection.end();
            });
    });