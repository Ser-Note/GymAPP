var express = require('express');
var router = express.Router();
const userDB = require('../database/db');



    // ---- Dashboard Router ---- //

    router.get('/', async function(req, res, next)  {
        if(!req.session || !req.session.username) 
        {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        else
        {
            const isAuthenticated = await userDB.getIsAuthenticated(req.session.username);
                res.render('dashboard',
                    {
                        
                        title: 'Dashboard',
                        isAuthenticated: isAuthenticated,
                        username: req.session.username
                    });
        }
    });
    

module.exports = router;