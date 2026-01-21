var express = require('express');
var router = express.Router();
const { userDB, my_workoutsDB, workoutExercisesDB } = require('../database/db');

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
            
            // Fetch exercises for each workout from the new structure
            const workoutsWithExercises = await Promise.all(
                workouts.map(async (workout) => {
                    // Check if workout uses new structure
                    if (workout.uses_new_structure) {
                        const exercises = await workoutExercisesDB.getWorkoutExercises(workout.id, user.id);
                        return {
                            ...workout,
                            exercisesData: exercises.map(we => ({
                                id: we.id,
                                name: we.exercise_templates.exercise_name,
                                targetMuscle: we.exercise_templates.target_muscle,
                                specificMuscle: we.exercise_templates.specific_muscle,
                                plannedSets: we.planned_sets,
                                plannedReps: we.planned_reps,
                                notes: we.notes
                            }))
                        };
                    } else {
                        // Legacy JSONB structure
                        return workout;
                    }
                })
            );
       
            res.render('myworkouts', {
                title: 'My Workouts',
                user: user,
                workouts: workoutsWithExercises
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

            const user = await userDB.getUserByName(req.session.username);
            const workout = await my_workoutsDB.getWorkoutById(workoutId);
            if (!workout) {
                return res.status(404).json({ success: false, message: 'Workout not found' });
            }

            let exercises = [];
            
            // Check if using new structure
            if (workout.uses_new_structure) {
                const workoutExercises = await workoutExercisesDB.getWorkoutExercises(workoutId, user.id);
                exercises = workoutExercises.map(we => ({
                    id: we.id,
                    name: we.exercise_templates.exercise_name,
                    targetMuscle: we.exercise_templates.target_muscle,
                    specificMuscle: we.exercise_templates.specific_muscle,
                    plannedSets: we.planned_sets,
                    plannedReps: we.planned_reps,
                    notes: we.notes
                }));
            } else {
                // Legacy JSONB structure
                exercises = workout.exercises || [];
            }

            return res.status(200).json({ 
                success: true, 
                workout: {
                    id: workout.id,
                    name: workout.workout_name,
                    exercises: exercises,
                    restTime: workout.rest_time || 3,
                    usesNewStructure: workout.uses_new_structure
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