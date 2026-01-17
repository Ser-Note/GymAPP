var express = require('express');
var router = express.Router();
const {userDB} = require('../database/db');

router.get('/', async function(req, res, next) {
    try {
        const username = req.session.username;
        const workoutId = req.query.id || req.session.workoutID;

        if (!username) {
            return res.status(401).send({ success: false, message: 'Unauthorized' });
        }

        if (!workoutId) {
            return res.status(400).redirect('/myWorkouts');
        }
        
        const user = await userDB.getUserByName(username);
        res.render('workingout', { 
            title: 'Working Out', 
            user: user,
            workoutId: workoutId
        });
    } catch (error) {
        console.error('Error loading working out page:', error);
        res.status(500).redirect('/myWorkouts');
    }
});

module.exports = router;