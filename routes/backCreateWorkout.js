var express = require('express');
var router = express.Router();
const { userDB } = require('../database/db');
const { my_workoutsDB } = require('../database/db');

    // ---- User My Workouts Router ---- //

router.get('/', async function(req, res, next)  {
    if(!req.session || !req.session.username)
    {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    else
    {
        const user = await userDB.getUserByName(req.session.username);
        
        res.render('createWorkouts', {
            title: 'Create Workouts',
            user: user
        });
    }
});


router.post('/create', async function(req, res, next) {
    if(!req.session || !req.session.username)
    {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    else
    {
        const workoutData = req.body;
        console.log('Received workout data:', workoutData);
        const user = await userDB.getUserByName(req.session.username);
        try {
            const lastWorkoutID = await my_workoutsDB.lastWorkoutID(user.user_name);
            const nextWorkoutID = lastWorkoutID !== null ? lastWorkoutID + 1 : 1;

            const newWorkout = await my_workoutsDB.addWorkout(
                user.id,
                user.user_name,
                nextWorkoutID,
                workoutData.workoutName,
                workoutData.exercises,
                workoutData.restTime
            );
            console.log('Workout saved:', newWorkout);
            res.status(200).json({ success: true, message: 'Workout created successfully' });
        } catch (error) {
            console.error('Error saving workout:', error);
            res.status(500).json({ success: false, message: 'Error creating workout' });
        }

    }
});

module.exports = router;