var express = require('express');
var router = express.Router();
const userDB = require('../database/db');


    // ---- Admin Manage Users Router ---- //

    router.get('/', async function(req, res, next)  {
        if(!req.session || !req.session.username)
        {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        else
        {
            const isAdmin = await userDB.getIsAdmin(req.session.username);
            if(!isAdmin)
            {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }
            else
            {
                const users = await userDB.getAllUsers();
                res.render('manageUsers', { 
                    title: 'Manage Users',
                    users: users,
                });
            }
        }
    });

    router.post('/authentication', async function(req, res, next) {
        if(!req.session || !req.session.username)
        {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        else
        {
            const isAdmin = await userDB.getIsAdmin(req.session.username);
            if(!isAdmin)
            {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }
            else
            {
                if(!req.body || !req.body.buttonId)
                {
                    return res.status(400).json({ success: false, message: 'Bad Request' });
                }
                else if(!req.body.username)
                {
                    return res.status(400).json({ success: false, message: 'Bad Request' });
                }
                else
                {
                    const buttonId = req.body.buttonId;

                    if(buttonId === 'btnAuthActive')
                    {
                        await userDB.setIsAuthenticated(req.body.username, true);
                    }
                    else if(buttonId === 'btnAuthPending')
                    {
                        await userDB.setIsAuthenticated(req.body.username, false);
                    }
                    else
                    {
                        return res.status(400).json({ success: false, message: 'Bad Request' });
                    }
                    return res.status(200).json({ success: true, message: 'User authentication status updated' });
                }
            }
        }
    });

    router.post('/admin', async function(req, res, next) {
        if(!req.session || !req.session.username)
        {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        else
        {
            const isAdmin = await userDB.getIsAdmin(req.session.username);
            if(!isAdmin)
            {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }
            else
            {
                if(!req.body || !req.body.buttonId)
                {
                    return res.status(400).json({ success: false, message: 'Bad Request' });
                }
                else if(!req.body.username)
                {
                    return res.status(400).json({ success: false, message: 'Bad Request' });
                }
                else
                {
                    const buttonId = req.body.buttonId;

                    if(buttonId === 'btnAdminActive')
                    {
                        await userDB.setIsAdmin(req.body.username, true);
                    }
                    else if(buttonId === 'btnAdminPending')
                    {
                        await userDB.setIsAdmin(req.body.username, false);
                    }
                    else
                    {
                        return res.status(400).json({ success: false, message: 'Bad Request' });
                    }
                    return res.status(200).json({ success: true, message: 'User authentication status updated' });
                }
            }
        }
    });
    
    router.post('/delete', async function(req, res, next) {
        if(!req.session || !req.session.username)
        {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        else
        {
            const isAdmin = await userDB.getIsAdmin(req.session.username);
            if(!isAdmin)
            {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }
            else
            {
                if(!req.body || !req.body.username)
                {
                    return res.status(400).json({ success: false, message: 'Bad Request' });
                }
                else
                {
                    await userDB.deleteUser(req.body.username);
                    return res.status(200).json({ success: true, message: 'User deleted successfully' });
                }
            }
        }
    });

module.exports = router;