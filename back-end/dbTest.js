const mysql = require('mysql2');

// Create a connection
const connection = mysql.createConnection({
    host: 'localhost', // Database host
    user: 'root',      // Replace with your MySQL username
    password: '',      // Replace with your MySQL password (leave empty if none)
    database: 'tollmanager' // The name of your database as shown in phpMyAdmin
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
});

// Close the connection
connection.end((err) => {
    if (err) {
        console.error('Error closing the connection:', err);
        return;
    }
    console.log('Connection closed.');
});
