const express = require('express');
const router = express.Router();

// Παράδειγμα διαδρομής login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === 'admin123') {
        res.status(200).json({ token: 'example-token' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

module.exports = router;