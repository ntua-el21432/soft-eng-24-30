require('dotenv').config();
const express = require('express');
const db = require('./utils/db.config');
const app = express();

app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SHOW TABLES');
        res.status(200).json({ success: true, tables: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});

app.get('/', (req, res) => {
    res.send("Hello World! This is the back-end server.");
})