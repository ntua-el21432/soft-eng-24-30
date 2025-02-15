const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config"); // Σύνδεση με MySQL

// POST /admin/resetpasses
router.post("/admin/resetpasses", async (req, res) => {
    try {
        console.log("🗑️ Starting cleanup of passes and related data...");

        // **1. Διαγραφή δεδομένων από πίνακες**
        await pool.query("DELETE FROM passes");
        await pool.query("DELETE FROM vehicletags");

        // **2. Επαναφορά του auto-increment**
        await pool.query("ALTER TABLE passes AUTO_INCREMENT = 1");
        await pool.query("ALTER TABLE vehicletags AUTO_INCREMENT = 1");

        console.log("✅ Passes and tags data cleared successfully.");
        res.json({ status: "OK", message: "Passes and tags cleared successfully." });

    } catch (err) {
        console.error("❌ Clear error:", err.message);
        res.status(500).json({ status: "failed", info: err.message });
    }
});

module.exports = router;
