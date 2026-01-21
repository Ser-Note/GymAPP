var express = require('express');
var router = express.Router();

// Home Route

router.get('/', function(req, res, next)  {
    // If user is already logged in, redirect to dashboard
    if (req.session && req.session.username) {
        return res.redirect('/dashboard');
    }
    
    res.render('index', 
        { 
            title: 'Sign In',
        });
});

module.exports = router;