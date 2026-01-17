var express = require('express');
var router = express.Router();
const {userDB} = require('../database/db');



    // ---- Dashboard Router ---- //

    router.get('/', async function(req, res, next)  {
        if(!req.session || !req.session.username) 
        {
            return res.status(401).json({ success: false, message: req.session.username + ' is Unauthorized' });
        }
        else 
        {
            const isAuthenticated = await userDB.getIsAuthenticated(req.session.username);
            const isAdmin = await userDB.getIsAdmin(req.session.username);

                res.render('dashboard',
                    {
                        
                        title: 'Dashboard',
                        isAuthenticated: isAuthenticated,
                        isAdmin: isAdmin,
                        username: req.session.username
                        
                    });
        }
    });
    

module.exports = router;