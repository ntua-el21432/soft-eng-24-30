const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

// 🔹 Connect to MySQL (`tollmanager` DB)
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tollmanager'
});

// 📌 **Login Endpoint (Creates a Token)**
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a unique token
        const token = crypto.randomBytes(32).toString('hex');

        // Store token in the database
        await db.query('INSERT INTO tokens (user_id, token) VALUES (?, ?)', [user.id, token]);

        return res.status(200).json({ token });
    } catch (error) {
        console.error('❌ Login Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 📌 **Middleware: Verify Token from `X-OBSERVATORY-AUTH`**
const verifyToken = async (req, res, next) => {
    const token = req.header('X-OBSERVATORY-AUTH');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM tokens WHERE token = ?', [token]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        req.user = rows[0].user_id; // Attach user ID to request
        next(); // Proceed to next middleware
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 📌 **Logout Endpoint (Deletes Token)**
router.post('/logout', async (req, res) => {
    const token = req.header('X-OBSERVATORY-AUTH');

    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }

    try {
        // Delete token from DB
        const [result] = await db.query('DELETE FROM tokens WHERE token = ?', [token]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        return res.sendStatus(200); // Successful logout
    } catch (error) {
        console.error('❌ Logout Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;