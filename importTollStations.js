const fs = require('fs');
const mysql = require('mysql2');
const csv = require('csv-parser');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Change if necessary
    password: '',  // Change if needed
    database: 'tollmanager'
});

// Read CSV file and insert toll stations
fs.createReadStream('tollstations2024.csv') // Ensure correct filename
    .pipe(csv({
        separator: ',', // Ensure correct delimiter
        mapHeaders: ({ header, index }) => {
            const headersMap = {
                0: "company_id",  // Use OpID directly as company_id
                2: "station_id",  // TollID is now used as station_id
                3: "station_name", // Add station_name from column index 3
                4: "position_marker", // Add position_marker from column index 4
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
    .on('data', (row) => {
        // Debugging: Print parsed row
        console.log("Row Data:", row);

        const company_id = row["company_id"]?.trim().toUpperCase();
        const station_id = row["station_id"]?.trim().toUpperCase();
        const station_name = row["station_name"]?.trim();
        const position_marker = row["position_marker"]?.trim().toUpperCase(); // Ensure uppercase

        if (!company_id || !station_id || !station_name) {
            console.warn(`Skipping row - Missing company_id, station_id, or station_name: ${row}`);
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

        // Insert into tollstations
        const query = `
            INSERT INTO tollstations (station_id, company_id, station_name, position_marker, locality, road, latitude, longitude, email, price1, price2, price3, price4)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                station_name = VALUES(station_name),
                position_marker = VALUES(position_marker),
                locality = VALUES(locality),
                road = VALUES(road),
                latitude = VALUES(latitude),
                longitude = VALUES(longitude),
                email = VALUES(email),
                price1 = VALUES(price1),
                price2 = VALUES(price2),
                price3 = VALUES(price3),
                price4 = VALUES(price4)
        `;

        connection.query(query, [station_id, company_id, station_name, position_marker, locality, road, latitude, longitude, email, price1, price2, price3, price4], (err, res) => {
            if (err) console.error('Insert error:', err);
            else console.log(`Inserted/Updated: ${station_id} - ${station_name} under company_id: ${company_id}`);
        });
    })
    .on('end', () => {
        console.log("CSV processing complete.");
        connection.end();
    });