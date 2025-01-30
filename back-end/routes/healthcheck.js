const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config"); // Σύνδεση με MySQL

// GET /admin/healthcheck
router.get("/admin/healthcheck", async (req, res) => {
    const dbConnectionString = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME 
    ? `mysql://${process.env.DB_USER}:${process.env.DB_PASS || ''}@${process.env.DB_HOST}/${process.env.DB_NAME}`
    : "Not Available";

  
   //console.log("DB Connection Details:", process.env.DB_HOST, process.env.DB_USER, process.env.DB_NAME);


    try {
        // Έλεγχος σύνδεσης με τη βάση δεδομένων
        const [stations] = await pool.query("SELECT COUNT(*) AS n_stations FROM tollstations");
        const [tags] = await pool.query("SELECT COUNT(*) AS n_tags FROM vehicletags");
        const [passes] = await pool.query("SELECT COUNT(*) AS n_passes FROM passes");

        // Ανάκτηση αριθμού εγγραφών
        const response = {
            status: "OK",
            dbconnection: dbConnectionString,
            n_stations: stations[0].n_stations,
            n_tags: tags[0].n_tags,
            n_passes: passes[0].n_passes
        };

        res.status(200).json(response);
    } catch (err) {
        console.error("Database connection failed:", err);

        // Σε περίπτωση αποτυχίας σύνδεσης
        res.status(401).json({
            status: "failed",
            dbconnection: dbConnectionString
        });
    }
});

module.exports = router;
