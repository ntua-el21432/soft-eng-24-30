const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../utils/db.config");

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
    }

    try {
        const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);

        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate a secure token
        const token = crypto.randomBytes(32).toString("hex");

        // Store the token in the database
        await db.query("INSERT INTO tokens (user_id, token) VALUES (?, ?)", [user.id, token]);

        return res.status(200).json({ token });
    } catch (error) {
        console.error("❌ Login Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;