var express = require('express');
var router = express.Router();
const { userDB } = require('../database/db');

    // ---- User My Workouts Router ---- //

    router.get('/', async function(req, res, next)  {
        if(!req.session || !req.session.username)
        {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        else
        {
            const user = await userDB.getUserByName(req.session.username);
            res.render('myWorkouts', {
                title: 'My Workouts',
                user: user
            });

        }
    });

module.exports = router;