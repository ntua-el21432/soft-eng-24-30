const fs = require('fs');
const mysql = require('mysql2');
const csv = require('csv-parser');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Change if necessary
    password: '',  // Change if needed
    database: 'tollmanager'
});

// Maps for fast lookup of foreign keys and company IDs
const tagMap = new Map();      // tag_name -> { tag_id, company_id }
const stationMap = new Map();  // station_name -> { station_id, company_id }

// Step 1: Load tag_id and company_id for each tag_name from vehicletags table
connection.query('SELECT tag_id, tag_name, company_id FROM vehicletags', (err, results) => {
    if (err) {
        console.error('Error fetching vehicle tags:', err);
        connection.end();
        return;
    }
    results.forEach(row => {
        tagMap.set(row.tag_name, { tag_id: row.tag_id, company_id: row.company_id });
    });
    console.log(`Loaded ${tagMap.size} vehicle tags into memory.`);

    // Step 2: Load station_id and company_id for each station_name from tollstations table
    connection.query('SELECT station_id, station_name, company_id FROM tollstations', (err, results) => {
        if (err) {
            console.error('Error fetching toll stations:', err);
            connection.end();
            return;
        }
        results.forEach(row => {
            stationMap.set(row.station_name, { station_id: row.station_id, company_id: row.company_id });
        });
        console.log(`Loaded ${stationMap.size} toll stations into memory.`);

        // Step 3: Read CSV file and insert pass records
        fs.createReadStream('passes-sample.csv') // Ensure correct filename
            .pipe(csv({
                separator: ',', // Ensure correct delimiter
                mapHeaders: ({ header, index }) => {
                    const headersMap = {
                        0: "timestamp",
                        1: "tollID",
                        2: "tagRef",
                        4: "charge"
                    };
                    return headersMap[index] || null; // Ignore other columns
                }
            }))
            .on('data', (row) => {
                // Debugging: Print parsed row
                console.log("Row Data:", row);

                const timestamp = row["timestamp"]?.trim();
                const charge = parseFloat(row["charge"]) || 0.00;
                const tagRef = row["tagRef"]?.trim();
                const tollID = row["tollID"]?.trim();

                const tagData = tagMap.get(tagRef); // Lookup tag_id and company_id
                const stationData = stationMap.get(tollID); // Lookup station_id and company_id

                if (!tagData || !stationData) {
                    console.warn(`Skipping row - Missing tag or station reference: ${row}`);
                    return;
                }

                const tag_id = tagData.tag_id;
                const station_id = stationData.station_id;
                const pass_type = tagData.company_id === stationData.company_id ? 'home' : 'visitor';

                // Insert into passes table
                const query = `
                    INSERT INTO passes (station_id, tag_id, timestamp, charge, pass_type)
                    VALUES (?, ?, ?, ?, ?)
                `;

                connection.query(query, [station_id, tag_id, timestamp, charge, pass_type], (err, res) => {
                    if (err) console.error('Insert error:', err);
                    else console.log(`Inserted pass for tag_id: ${tag_id} at station_id: ${station_id} with pass_type: ${pass_type}`);
                });
            })
            .on('end', () => {
                console.log("CSV processing complete.");
                connection.end();
            });
    });
});