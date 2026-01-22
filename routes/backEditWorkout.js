express = require('express');
var router = express.Router();
const { userDB, my_workoutsDB, workoutExercisesDB } = require('../database/db');

// ---- Edit Workout Router ---- //

// GET - Fetch workout details for editing
router.post('/', async function(req, res, next)  {
    const workoutID = req.body.workoutID;
    const username = await userDB.getUserByName(req.session.username);

    console.log("Received request to edit workout ID: " + workoutID);
    if(!workoutID) {
        return res.status(400).json({ success: false, message: workoutID + ' is an Invalid Workout ID' });
    }
    
    try {
        const myWorkout = await my_workoutsDB.getWorkoutById(workoutID);

        if(!myWorkout) {
            return res.status(404).json({ success: false, message: 'Workout not found' });
        }

        let exercises = [];

        // Check if using new structure
        if (myWorkout.uses_new_structure) {
            // Fetch from workout_exercises with joins
            exercises = await workoutExercisesDB.getWorkoutExercises(workoutID, username.id);
            exercises = exercises.map(we => ({
                id: we.id,
                workoutID: myWorkout.id,
                name: we.exercise_templates.exercise_name,
                targetMuscle: we.exercise_templates.target_muscle,
                specificMuscle: we.exercise_templates.specific_muscle,
                plannedSets: we.planned_sets,
                plannedReps: we.planned_reps,
                notes: we.notes
            }));
        } else {
            // Legacy JSONB structure - still editable for backward compatibility
            exercises = (myWorkout.exercises || []).map(ex => ({
                name: ex.name,
                sets: ex.sets,
                subtype: ex.subType,
                targetReps: ex.targetReps,
                exerciseType: ex.exerciseType
            }));
        }

        console.log("Exercises loaded:", exercises);

        res.render('editWorkouts', {
            title: 'Edit Workout',
            myWorkout: myWorkout,
            exercises: exercises,
            user: username
        });
    } catch (error) {
        console.error('Error loading workout:', error);
        return res.status(500).json({ success: false, message: 'Error loading workout' });
    }
});

// POST - Update workout
router.post('/edit', async function(req, res, next)  {
    const workoutID = req.body.workoutID;
    const workoutName = req.body.workoutName;
    const restTime = req.body.restTime;
    const exercises = req.body.exercises; // Array of exercises with updated config

    console.log("Received request to update workout ID: " + workoutID);

    if(!workoutID || !workoutName || !exercises) {
        return res.status(400).json({ success: false, message: 'Invalid input data' });
    }
    
    try {
        const user = await userDB.getUserByName(req.session.username);
        const myWorkout = await my_workoutsDB.getWorkoutById(workoutID);
        
        if(!myWorkout) {
            return res.status(404).json({ success: false, message: 'Workout not found' });
        }

        // Update workout name and rest time
        await my_workoutsDB.updateWorkoutById(workoutID, workoutName, null, restTime || 0);

        // Check if using new structure
        if (myWorkout.uses_new_structure) {
            // Update each exercise's planned config
            for (const exercise of exercises) {
                if (exercise.id) {
                    await workoutExercisesDB.updateWorkoutExercise(exercise.id, {
                        planned_sets: parseInt(exercise.plannedSets) || 3,
                        planned_reps: exercise.plannedReps || '10',
                        notes: exercise.notes || null
                    });
                }
            }
        } else {
            // Legacy - update JSONB exercises
            const updatedExercises = exercises.map(ex => ({
                name: ex.name,
                sets: ex.sets,
                subType: ex.subtype,
                targetReps: ex.targetReps,
                exerciseType: ex.exerciseType,
                authenticated: ex.authenticated
            }));
            await my_workoutsDB.updateWorkoutById(workoutID, workoutName, updatedExercises, restTime || 0);
        }

        console.log("Workout updated successfully");
        return res.status(200).json({ success: true, message: 'Workout updated successfully' });
    } catch (error) {
        console.error("Error updating workout:", error);
        return res.status(500).json({ success: false, message: 'Error updating workout: ' + error.message });
    }
});

module.exports = router;