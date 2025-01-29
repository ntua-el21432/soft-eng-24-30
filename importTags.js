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

// Step 1: Load all companies into the map (company_abbr -> company_id)
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

    // Step 2: Read CSV file and insert unique vehicle tags
    const uniqueTags = new Map(); // To store unique tagRef values

    fs.createReadStream('passes-sample.csv') // Ensure correct filename
        .pipe(csv({
            separator: ',', // Ensure correct delimiter
            mapHeaders: ({ header, index }) => {
                const headersMap = {
                    2: "tagRef",
                    3: "tagHomeID"
                };
                return headersMap[index] || null; // Ignore other columns
            }
        }))
        .on('data', (row) => {
            // Debugging: Print parsed row
            console.log("Row Data:", row);

            const tag_name = row["tagRef"]?.trim();
            const companyAbbr = row["tagHomeID"]?.trim().toUpperCase();
            const company_id = companyMap.get(companyAbbr); // Lookup company_id

            if (!tag_name || !company_id) {
                console.warn(`Skipping row - Missing tagRef or unknown company: ${row}`);
                return;
            }

            // Ensure only unique tagRef values are stored
            if (!uniqueTags.has(tag_name)) {
                uniqueTags.set(tag_name, company_id);
            }
        })
        .on('end', () => {
            console.log(`Found ${uniqueTags.size} unique vehicle tags.`);

            const query = `
                INSERT INTO vehicletags (company_id, tag_name)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE company_id = VALUES(company_id)
            `;

            uniqueTags.forEach((company_id, tag_name) => {
                connection.query(query, [company_id, tag_name], (err, res) => {
                    if (err) console.error('Insert error:', err);
                    else console.log(`Inserted/Updated: ${tag_name} under company_id: ${company_id}`);
                });
            });

            connection.end();
        });
});
