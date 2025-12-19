var express = require('express');
var router = express.Router();

// Home Route

router.get('/', function(req, res, next)  {
    res.render('index', 
        { 
            title: 'Sign In',
        });
});

module.exports = router;