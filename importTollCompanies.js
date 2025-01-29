const fs = require('fs');
const mysql = require('mysql2');
const csv = require('csv-parser');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Change if necessary
    password: '',  // Change if needed
    database: 'tollmanager'
});

// Using a Map to store unique companies
const uniqueCompanies = new Map();

fs.createReadStream('tollstations2024.csv') // Ensure the filename is correct
    .pipe(csv({
        separator: ',', // Ensure correct delimiter
        mapHeaders: ({ header, index }) => {
            const headersMap = {
                0: "OpID",
                1: "Operator"
            };
            return headersMap[index] || null; // Only keep needed headers
        }
    }))
    .on('data', (row) => {
        console.log("Row Data:", row); // Debugging: Check parsed headers

        // Extract company_abbr and company_name correctly
        const companyAbbr = row["OpID"]?.trim().toUpperCase();
        const companyName = row["Operator"]?.trim();

        if (!companyAbbr || !companyName) {
            console.warn("Skipping row due to missing OpID or Operator:", row);
            return;
        }

        // Ensure we only store unique OpID → Operator pairs
        if (!uniqueCompanies.has(companyAbbr)) {
            uniqueCompanies.set(companyAbbr, companyName);
        }
    })
    .on('end', () => {
        console.log(`Found ${uniqueCompanies.size} unique companies.`);

        const query = `
            INSERT INTO tollcompanies (company_name, company_abbr) 
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE company_name = VALUES(company_name)
        `;

        uniqueCompanies.forEach((companyName, companyAbbr) => {
            connection.query(query, [companyName, companyAbbr], (err, res) => {
                if (err) console.error('Insert error:', err);
                else console.log(`Inserted/Updated: ${companyAbbr} - ${companyName}`);
            });
        });

        connection.end();
    });
