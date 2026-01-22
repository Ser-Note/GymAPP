var express = require('express');
var router = express.Router();
const { userDB, my_workoutsDB, workoutExercisesDB, exerciseLogsDB, workoutSessionsDB } = require('../database/db');

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

            // Look for an active (incomplete) session to resume progress
            let activeSession = null;
            let sessionLogsByExercise = {};
            try {
                activeSession = await workoutSessionsDB.getActiveSessionForWorkout(workoutId, user.id);
                if (activeSession) {
                    const sessionLogs = await exerciseLogsDB.getSessionLogs(activeSession.id);
                    sessionLogs.forEach(log => {
                        const exId = log.workout_exercise_id;
                        if (!sessionLogsByExercise[exId]) sessionLogsByExercise[exId] = [];
                        sessionLogsByExercise[exId].push(log);
                    });
                }
            } catch (err) {
                console.warn('Could not fetch active session:', err.message);
            }

            let exercises = [];
            
            // Check if using new structure
            if (workout.uses_new_structure) {
                const workoutExercises = await workoutExercisesDB.getWorkoutExercises(workoutId, user.id);
                exercises = await Promise.all(workoutExercises.map(async (we) => {
                    // Fetch last performance (historical) to show previous reps/weight
                    let lastPerformance = [];
                    try {
                        lastPerformance = await exerciseLogsDB.getLastPerformance(we.id, user.id);
                    } catch (err) {
                        console.warn(`Could not fetch last performance for exercise ${we.id}:`, err.message);
                    }

                    // Exclude logs from the active session when showing historical "previous" values
                    const filteredPerformance = activeSession
                        ? lastPerformance.filter(log => log.workout_session_id !== activeSession.id)
                        : lastPerformance;
                    const limitedPerformance = filteredPerformance.slice(0, we.planned_sets);

                    // If we have an active session, use its logs to mark completed sets
                    const sessionLogs = sessionLogsByExercise[we.id] || [];
                    const sessionLogBySet = {};
                    sessionLogs.forEach(log => {
                        sessionLogBySet[log.set_number] = log;
                    });

                    const sets = Array.from({ length: we.planned_sets }, (_, i) => {
                        const setNumber = i + 1;
                        const sessionLog = sessionLogBySet[setNumber];
                        const prevPerf = limitedPerformance[i];
                        return {
                            id: sessionLog ? sessionLog.id : setNumber,
                            setNumber: setNumber,
                            reps: '',
                            weight: sessionLog ? sessionLog.weight_used : null,
                            completedReps: sessionLog ? sessionLog.reps_completed : null,
                            previousReps: sessionLog ? sessionLog.reps_completed : (prevPerf ? prevPerf.reps : null),
                            previousWeight: sessionLog ? sessionLog.weight_used : (prevPerf ? prevPerf.weight : null),
                            plannedWeight: prevPerf ? prevPerf.weight : null,
                            plannedReps: prevPerf ? prevPerf.reps : null,
                            notes: sessionLog ? sessionLog.notes : (prevPerf ? prevPerf.notes : null)
                        };
                    });

                    return {
                        id: we.id,
                        name: we.exercise_templates.exercise_name,
                        targetMuscle: we.exercise_templates.target_muscle,
                        specificMuscle: we.exercise_templates.specific_muscle,
                        targetSets: we.planned_sets,
                        targetReps: we.planned_reps,
                        notes: we.notes,
                        sets: sets
                    };
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
                    usesNewStructure: workout.uses_new_structure,
                    activeSessionId: activeSession ? activeSession.id : null
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