var express = require('express');
var router = express.Router();
const { userDB } = require('../database/db');
const { my_workoutsDB } = require('../database/db');

// ---- Edit Workout Router ---- //

router.get('/', async function(req, res, next)  {
    try {
        const user = await userDB.getUserByName(req.session.username);
        const workouts = await my_workoutsDB.getWorkoutsByUsername(user.user_name);
        
        console.log('User:', user);
        console.log('Workouts:', workouts);
        
        if (!workouts || workouts.length === 0) {
            return res.status(404).json({ success: false, message: 'Workout not found' });
        }

        const workout = workouts[0];
        console.log('Selected workout:', workout);

        if (!workout.exercises) {
            return res.status(404).json({ success: false, message: 'Workout not found' });
        }

        const exercises = workout.exercises.map(ex => ({
            workoutname: workout.workout_name,
            name: ex.name,
            sets: ex.sets,                    // Array of {id, reps, weight, setNumber}
            subtype: ex.subType,              // Note: subType (capital T)
            targetReps: ex.targetReps,
            targetSets: ex.targetSets,
            exerciseType: ex.exerciseType,
            authenticated: ex.authenticated
        }));

        console.log('Exercises to render:', exercises);

        res.render('editWorkouts', {
            title: 'Edit Workout',
            user: user,
            exercises: exercises
        });
    } catch (err) {
        console.error('Edit workout error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;