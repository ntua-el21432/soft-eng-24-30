require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Προαιρετικά αν χρειάζεται
const db = require('./utils/db.config');

// Import routes
const tollStationPassesRoutes = require("./routes/tollStationPasses");
const passAnalysisRoutes = require("./routes/passAnalysis");
const passesCostRoutes = require("./routes/passesCost");
const chargesByRoutes = require("./routes/chargesBy");



const app = express();

app.use(express.json()); // Middleware για JSON parsing
app.use(cors()); // Αν χρειαστεί για Cross-Origin Requests

// Test route για έλεγχο της σύνδεσης στη βάση
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SHOW TABLES');
        res.status(200).json({ success: true, tables: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Συνδέουμε τα API routes
app.use("/api", tollStationPassesRoutes);
app.use("/api", passAnalysisRoutes);
app.use("/api", passesCostRoutes);
app.use("/api", chargesByRoutes);

// Default route
app.get('/', (req, res) => {
    res.send("Hello World! This is the back-end server.");
});

module.exports = app; // Σωστό export του app για χρήση από το server.js
