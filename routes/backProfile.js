var express = require('express');
var router = express.Router();
const userDB = require('../database/db');

    // ---- Back Profile Router ---- //

    router.get('/', async function(req, res, next)  {
        if(!req.session || !req.session.username)
        {
            return res.redirect('/');
        }
        else
        {
            const user = await userDB.getUserByName(req.session.username);
            const isAdmin = await userDB.getIsAdmin(req.session.username);

            if(!user)
            {
                return res.redirect('/');
            }
            else
            {
                res.render('profile', { 
                    title: 'Profile',
                    user: user,
                });
            }
        }
    });

router.post('/update', async function(req, res, next) {
    if(!req.session || !req.session.username)
    {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    else
    {
        if(req.body.username === '' && req.body.password === '')
        {
            return res.status(400).json({ success: false, message: 'Username or password are required' });
        }
        else
        {
            if(req.body.username !== req.session.username && req.body.username != null && req.body.username !== '')
            {
                await userDB.updateUsername(req.session.username, req.body.username);
                req.session.username = req.body.username;
            }
            if(req.body.password !== '' && req.body.password != null)
            {
                await userDB.updatePassword(req.session.username, req.body.password);
                
            }
            return res.json({ success: true, message: 'Profile updated successfully' });
        }
    }
});

module.exports = router;