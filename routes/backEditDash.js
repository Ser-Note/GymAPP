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
        const exercises = [];
        
        workouts.forEach(workout => {
            if (workout.exercises && Array.isArray(workout.exercises)) {
                const workoutExercises = workout.exercises.map(ex => ({
                    workoutname: workout.workout_name,
                    workoutID: workout.id,
                    name: ex.name,
                    sets: ex.sets,                    // Array of {id, reps, weight, setNumber}
                    subtype: ex.subType,              // Note: subType (capital T)
                    targetReps: ex.targetReps,
                    targetSets: ex.targetSets,
                    exerciseType: ex.exerciseType,
                    authenticated: ex.authenticated
                }));
                exercises.push(...workoutExercises);
            }
        });

        console.log('Exercises to render:', exercises);

        res.render('editDashboard', {
            title: 'Edit Workout',
            user: user,
            workouts: workouts
        });
    } catch (err) {
        console.error('Edit workout error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/delete', async function(req, res, next)  {
    const workoutID = req.body.workoutID;
    console.log("Received request to delete workout ID: " + workoutID);
    if(!workoutID) {
        return res.status(400).json({ success: false, message: workoutID + ' is an Invalid Workout ID' });
    }
    
    try {
        const deletedWorkout = await my_workoutsDB.deleteWorkoutById(workoutID);
        if(!deletedWorkout) {
            return res.status(404).json({ success: false, message: 'Workout not found or could not be deleted' });
        }
        console.log("Workout deleted: ", deletedWorkout);
        return res.status(200).json({ success: true, message: 'Workout deleted successfully' });
    } catch (error) {
        console.error('Error deleting workout:', error);
        return res.status(500).json({ success: false, message: 'Error deleting workout: ' + error.message });
    }
});
module.exports = router;