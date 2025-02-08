const express = require("express");
const router = express.Router();
const db = require("../utils/db.config");

router.post("/logout", async (req, res) => {
    const token = req.header("X-OBSERVATORY-AUTH");

    if (!token) {
        return res.status(400).json({ error: "Token required" });
    }

    try {
        // Remove token from the database
        const [result] = await db.query("DELETE FROM tokens WHERE token = ?", [token]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("❌ Logout Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;