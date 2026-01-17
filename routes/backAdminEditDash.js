var express = require('express');
var router = express.Router();
const { userDB } = require('../database/db');
const { my_workoutsDB } = require('../database/db');
const { exerciseDB } = require('../database/db');

// ---- Admin Edit Dashboard Router ---- //

router.get('/', async function(req, res, next)  {
    try {
        if(!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const adminUser = await userDB.getUserByName(req.session.username);
        const targetUsername = req.query.username || req.session.targetUsername;
        
        console.log('Query params:', req.query);
        console.log('Target username:', targetUsername);
        
        if (!targetUsername) {
            return res.status(400).json({ success: false, message: 'No username provided', query: req.query });
        }
        
        const user = await userDB.getUserByName(targetUsername);
        const workouts = await my_workoutsDB.getWorkoutsByUsername(user.user_name);
        
        console.log('Admin User:', adminUser);
        console.log('Target User:', user);
        console.log('Workouts:', workouts);
        
        if (!workouts || workouts.length === 0) {
            return res.render('adminEditDashboard', {
                title: 'Edit Workouts',
                user: adminUser,
                targetUser: user,
                workouts: [],
                targetUsername: targetUsername
            });
        }
        
        const exercises = [];
        workouts.forEach(workout => {
            if (workout.exercises && Array.isArray(workout.exercises)) {
                const workoutExercises = workout.exercises.map(ex => ({
                    workoutname: workout.workout_name,
                    workoutID: workout.id,
                    name: ex.name,
                    sets: ex.sets,
                    subtype: ex.subType,
                    targetReps: ex.targetReps,
                    targetSets: ex.targetSets,
                    exerciseType: ex.exerciseType,
                    authenticated: ex.authenticated
                }));
                exercises.push(...workoutExercises);
            }
        });

        console.log('Exercises to render:', exercises);

        res.render('adminEditDashboard', {
            title: 'Edit Workouts',
            user: adminUser,
            targetUser: user,
            workouts: workouts,
            targetUsername: targetUsername
        });
    } catch (err) {
        console.error('Admin edit workout error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/', async function(req, res, next)  {
    try {
        if(!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const targetUsername = req.body.username;
        
        if (!targetUsername) {
            return res.status(400).json({ success: false, message: 'No username provided' });
        }
        
        // Store the target username in session for the GET request
        req.session.targetUsername = targetUsername;
        
        return res.status(200).json({ success: true, message: 'Username set' });
    } catch (err) {
        console.error('Error setting username:', err);
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

router.post('/authenticateExercise', async function(req, res, next) {
    try {
        if(!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const isAdmin = await userDB.getIsAdmin(req.session.username);
        if(!isAdmin) {
            return res.status(403).json({ success: false, message: 'Forbidden: Only admins can authenticate exercises' });
        }

        const { exerciseUuid, isAuthenticated } = req.body;

        const exerciseData = await my_workoutsDB.getExerciseByUuid(exerciseUuid);

        if (!exerciseData || !exerciseData.exercises || exerciseData.exercises.length === 0) {
            return res.status(404).json({ success: false, message: 'Exercise not found' });
        }

        let subType = exerciseData.exercises[0].subType;
        let exerciseType = exerciseData.exercises[0].exerciseType;

        console.log('Exercise Data Retrieved:', exerciseData);

        if(!exerciseUuid) {
            return res.status(400).json({ success: false, message: 'Exercise UUID is required' });
        }

        const updatedExercise = await exerciseDB.updateExerciseAuthentication(exerciseUuid, isAuthenticated, subType, exerciseType);
        
        if(!updatedExercise) {
            return res.status(404).json({ success: false, message: 'Exercise not found' });
        }

        console.log('Exercise authenticated:', updatedExercise);
        return res.status(200).json({ success: true, message: 'Exercise authentication status updated', exercise: updatedExercise });
    } catch (error) {
        console.error('Error authenticating exercise:', error);
        return res.status(500).json({ success: false, message: 'Error authenticating exercise: ' + error.message });
    }
});

module.exports = router;