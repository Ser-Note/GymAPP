var express = require('express');
var router = express.Router();

const { userDB } = require('../database/db');

// ---- Login Route ---- //

router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        const user = await userDB.login(username, password);

        if (user) {
            req.session.username = user.user_name;
            req.session.userId = user.id;
            return res.json({ success: true, message: 'Login successful' });
        }

        return res.status(401).json({ success: false, message: 'Invalid username or password' });
    } catch (err) {
        console.error('Login error:', err);
        console.error('Error details:', err.message, err.code);
        return res.status(500).json({ success: false, message: 'Server error during login', error: err.message });
    }
});

module.exports = router;