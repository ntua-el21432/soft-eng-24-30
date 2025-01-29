const fs = require('fs');
const mysql = require('mysql2');
const csv = require('csv-parser');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Change if necessary
    password: '',  // Change if needed
    database: 'tollmanager'
});

// A map to store company_abbr -> company_id for quick lookup
const companyMap = new Map();

// Step 1: Load all companies into the map (OpID -> company_id)
connection.query('SELECT company_id, company_abbr FROM tollcompanies', (err, results) => {
    if (err) {
        console.error('Error fetching companies:', err);
        connection.end();
        return;
    }

    results.forEach(row => {
        companyMap.set(row.company_abbr, row.company_id);
    });

    console.log(`Loaded ${companyMap.size} companies into memory.`);

    // Step 2: Read CSV file and insert toll stations
    fs.createReadStream('tollstations2024.csv') // Ensure correct filename
        .pipe(csv({
            separator: ',', // Ensure correct delimiter
            mapHeaders: ({ header, index }) => {
                const headersMap = {
                    0: "OpID",
                    2: "TollID",
                    4: "PM",
                    5: "Locality",
                    6: "Road",
                    7: "Lat",
                    8: "Long",
                    9: "Email",
                    10: "Price1",
                    11: "Price2",
                    12: "Price3",
                    13: "Price4"
                };
                return headersMap[index] || null;
            }
        }))
        .on('data', (row) => {
            // Debugging: Print parsed row
            console.log("Row Data:", row);

            const companyAbbr = row["OpID"]?.trim().toUpperCase();
            const company_id = companyMap.get(companyAbbr); // Lookup company_id

            if (!company_id) {
                console.warn(`Skipping row - Company not found for OpID: ${companyAbbr}`);
                return;
            }

            const station_name = row["TollID"]?.trim();
            const position_marker = row["PM"]?.trim();
            const locality = row["Locality"]?.trim();
            const road = row["Road"]?.trim();
            const latitude = parseFloat(row["Lat"]);
            const longitude = parseFloat(row["Long"]);
            const email = row["Email"]?.trim();
            const price1 = parseFloat(row["Price1"]) || 0.00;
            const price2 = parseFloat(row["Price2"]) || 0.00;
            const price3 = parseFloat(row["Price3"]) || 0.00;
            const price4 = parseFloat(row["Price4"]) || 0.00;

            // Insert into tollstations
            const query = `
                INSERT INTO tollstations (company_id, station_name, position_marker, locality, road, latitude, longitude, email, price1, price2, price3, price4)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            connection.query(query, [company_id, station_name, position_marker, locality, road, latitude, longitude, email, price1, price2, price3, price4], (err, res) => {
                if (err) console.error('Insert error:', err);
                else console.log(`Inserted: ${station_name} under company_id: ${company_id}`);
            });
        })
        .on('end', () => {
            console.log("CSV processing complete.");
            connection.end();
        });
});

