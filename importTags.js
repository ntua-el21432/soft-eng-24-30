const fs = require('fs');
const mysql = require('mysql2');
const csv = require('csv-parser');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Change if necessary
    password: '',  // Change if needed
    database: 'tollmanager'
});

// Read CSV file and insert unique vehicle tags
const uniqueTags = new Map(); // To store unique tagRef values

fs.createReadStream('passes-sample.csv') // Ensure correct filename
    .pipe(csv({
        separator: ',', // Ensure correct delimiter
        mapHeaders: ({ header, index }) => {
            const headersMap = {
                2: "tag_id",   // tagRef is now used as tag_id
                3: "company_id" // tagHomeID is now used as company_id
            };
            return headersMap[index] || null; // Ignore other columns
        }
    }))
    .on('data', (row) => {
        // Debugging: Print parsed row
        console.log("Row Data:", row);

        const tag_id = row["tag_id"]?.trim();
        const company_id = row["company_id"]?.trim().toUpperCase(); // Ensure uppercase for consistency

        if (!tag_id || !company_id) {
            console.warn(`Skipping row - Missing tag_id or company_id: ${row}`);
            return;
        }

        // Ensure only unique tag_id values are stored
        if (!uniqueTags.has(tag_id)) {
            uniqueTags.set(tag_id, company_id);
        }
    })
    .on('end', () => {
        console.log(`Found ${uniqueTags.size} unique vehicle tags.`);

        const query = `
            INSERT INTO vehicletags (tag_id, company_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE company_id = VALUES(company_id)
        `;

        uniqueTags.forEach((company_id, tag_id) => {
            connection.query(query, [tag_id, company_id], (err, res) => {
                if (err) console.error('Insert error:', err);
                else console.log(`Inserted/Updated: ${tag_id} under company_id: ${company_id}`);
            });
        });

        connection.end();
    });