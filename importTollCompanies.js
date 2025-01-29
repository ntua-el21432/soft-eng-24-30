const fs = require('fs');
const mysql = require('mysql2');
const csv = require('csv-parser');

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Change if necessary
    password: '',  // Change if you have a password
    database: 'tollmanager'
});

// Read CSV and Insert into Database
fs.createReadStream('tollstations.csv') // Ensure the CSV file is in the same directory
    .pipe(csv())
    .on('data', (row) => {
        const query = `
            INSERT INTO tollcompanies (company_name, company_abbr) 
            VALUES (?, ?)
        `;

        // Map OpID -> company_abbr, Operator -> company_name
        connection.query(query, [
            row.Operator, // company_name
            row.OpID      // company_abbr
        ], (err, res) => {
            if (err) console.error('Insert error:', err);
            else console.log('Inserted company_id:', res.insertId);
        });
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        connection.end();
    });
