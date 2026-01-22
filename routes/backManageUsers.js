var express = require('express');
var router = express.Router();
const {userDB, exerciseTemplatesDB} = require('../database/db');


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
                const pendingExercises = await exerciseTemplatesDB.getPendingExercises();
                res.render('manageUsers', { 
                    title: 'Manage Users',
                    users: users,
                    pendingExercises: pendingExercises
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
                if(!req.body)
                {
                    console.error('Missing request body');
                    return res.status(400).json({ success: false, message: 'Bad Request: Missing body' });
                }
                if(!req.body.buttonId)
                {
                    console.error('Missing buttonId in request body:', req.body);
                    return res.status(400).json({ success: false, message: 'Bad Request: Missing buttonId' });
                }
                if(!req.body.username)
                {
                    console.error('Missing username in request body');
                    return res.status(400).json({ success: false, message: 'Bad Request: Missing username' });
                }
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
                        return res.status(400).json({ success: false, message: 'Bad Request: Invalid buttonId' });
                    }
                    return res.status(200).json({ success: true, message: 'User authentication status updated' });
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

    router.post('/editWorkouts', async function(req, res, next) {
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
                    return res.status(200).json({ success: true, redirectUrl: '/adminEditDash?username=' + encodeURIComponent(req.body.username) });
                }
            }
        }
    });

    router.post('/approveExercise', async function(req, res, next) {
        try {
            if(!req.session || !req.session.username)
            {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            
            const isAdmin = await userDB.getIsAdmin(req.session.username);
            if(!isAdmin)
            {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            const { exerciseId, isPublic } = req.body;
            if (!exerciseId || isPublic === undefined)
            {
                return res.status(400).json({ success: false, message: 'Missing exerciseId or isPublic' });
            }

            const updatedExercise = await exerciseTemplatesDB.updateTemplateStatus(exerciseId, isPublic);
            
            return res.status(200).json({ 
                success: true, 
                message: isPublic ? 'Exercise approved and made public' : 'Exercise rejected',
                exercise: updatedExercise
            });
        } catch (err) {
            console.error('Error approving exercise:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    });

module.exports = router;