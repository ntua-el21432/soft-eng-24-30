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
                0: "company_id",  // Use OpID as company_id
                1: "company_name" // Use Operator as company_name
            };
            return headersMap[index] || null; // Only keep needed headers
        }
    }))
    .on('data', (row) => {
        console.log("Row Data:", row); // Debugging: Check parsed headers

        // Extract company_id and company_name correctly
        const companyId = row["company_id"]?.trim().toUpperCase();
        const companyName = row["company_name"]?.trim();

        if (!companyId || !companyName) {
            console.warn("Skipping row due to missing company_id or company_name:", row);
            return;
        }

        // Ensure we only store unique company_id → company_name pairs
        if (!uniqueCompanies.has(companyId)) {
            uniqueCompanies.set(companyId, companyName);
        }
    })
    .on('end', () => {
        console.log(`Found ${uniqueCompanies.size} unique companies.`);

        const query = `
            INSERT INTO tollcompanies (company_id, company_name) 
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE company_name = VALUES(company_name)
        `;

        uniqueCompanies.forEach((companyName, companyId) => {
            connection.query(query, [companyId, companyName], (err, res) => {
                if (err) console.error('Insert error:', err);
                else console.log(`Inserted/Updated: ${companyId} - ${companyName}`);
            });
        });

        connection.end();
    });
