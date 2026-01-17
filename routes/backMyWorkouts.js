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
            const workouts = await my_workoutsDB.getWorkoutsByUsername(user.user_name);
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
       
            res.render('myworkouts', {
                title: 'My Workouts',
                user: user,
                workouts: workouts
            });

        }
    });

    // Get current workout to execute
    router.get('/current', async function(req, res, next) {
        try {
            if(!req.session || !req.session.username) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const workoutId = req.query.id;
            if (!workoutId) {
                return res.status(400).json({ success: false, message: 'Workout ID required' });
            }

            const workout = await my_workoutsDB.getWorkoutById(workoutId);
            if (!workout) {
                return res.status(404).json({ success: false, message: 'Workout not found' });
            }

            return res.status(200).json({ 
                success: true, 
                workout: {
                    id: workout.id,
                    name: workout.workout_name,
                    exercises: workout.exercises || [],
                    restTime: workout.rest_time || 3
                }
            });
        } catch (err) {
            console.error('Error fetching current workout:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    // Save workout progress
    router.post('/saveProgress', async function(req, res, next) {
        try {
            if(!req.session || !req.session.username) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const { workoutId, exercises } = req.body;
            if (!workoutId || !exercises) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            // Get current workout to preserve existing data
            const currentWorkout = await my_workoutsDB.getWorkoutById(workoutId);
            if (!currentWorkout) {
                return res.status(404).json({ success: false, message: 'Workout not found' });
            }

            // Update the workout with completed exercises, preserving name and rest time
            const updatedWorkout = await my_workoutsDB.updateWorkoutById(
                workoutId,
                currentWorkout.workout_name, // Keep existing name
                exercises,
                currentWorkout.rest_time // Keep existing rest time
            );

            if (!updatedWorkout) {
                return res.status(404).json({ success: false, message: 'Failed to save progress' });
            }

            return res.status(200).json({ 
                success: true, 
                message: 'Workout progress saved',
                workout: updatedWorkout
            });
        } catch (err) {
            console.error('Error saving workout progress:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    });

module.exports = router;