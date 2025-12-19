var express = require('express');
var router = express.Router();
const userDB = require('../database/db');

// ---- Register Router ---- //

    router.get('/', function(req, res, next)  {
    res.render('register', 
        {
            title: 'Sign Up',
        });

});

    router.post('/', async (req, res, next) => {
        try {
            const {username, password} = req.body;
            if (!username || !password) {
                return res.status(400).json({ success: false, message: 'Username and password required' });
            }
            else
            {
                const user = await userDB.register(username,password);

                if (user) {
                    req.session.username = user.user_name;
                    req.session.userId = user.id;
                    return res.json({ success: true, message: 'Registration successful' });
                }
                else
                {
                    return res.status(401).json({ success: false, message: 'Registration failed' });
                }
            }
        }catch (err) {
            console.error('Registration error:', err);
            return res.status(500).json({ success: false, message: 'Server error during registration' });
        }
});
module.exports = router;