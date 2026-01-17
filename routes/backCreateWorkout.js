var express = require('express');
var router = express.Router();
const { userDB } = require('../database/db');
const { my_workoutsDB } = require('../database/db');
const { exerciseDB } = require('../database/db');

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
            // Create exercises in the exercise table and get their UUIDs
            const exercisesWithUuids = [];
            
            for (const exercise of workoutData.exercises) {
                const createdExercise = await exerciseDB.createExercise(
                    exercise.name,
                    exercise.targetMuscle || null,
                    exercise.specificMuscle || null
                );
                
                exercisesWithUuids.push({
                    ...exercise,
                    uuid: createdExercise.uuid
                });
            }

            const newWorkout = await my_workoutsDB.addWorkout(
                user.id,
                user.user_name,
                workoutData.workoutName,
                exercisesWithUuids,
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