var express = require('express');
var router = express.Router();
const { userDB, my_workoutsDB, exerciseTemplatesDB, workoutExercisesDB } = require('../database/db');

    // ---- User My Workouts Router ---- //

router.get('/', async function(req, res, next)  {
    if(!req.session || !req.session.username)
    {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    else
    {
        const user = await userDB.getUserByName(req.session.username);
        const availableExercises = await exerciseTemplatesDB.getAvailableTemplates(user.id);
        
        res.render('createWorkouts', {
            title: 'Create Workouts',
            user: user,
            availableExercises: availableExercises
        });
    }
});

router.get('/getExercises', async function(req, res, next) {
    if(!req.session || !req.session.username)
    {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    else
    {
        try {
            const user = await userDB.getUserByName(req.session.username);
            const availableExercises = await exerciseTemplatesDB.getAvailableTemplates(user.id);
            
            return res.status(200).json({ 
                success: true, 
                exercises: availableExercises
            });
        } catch (error) {
            console.error('Error fetching exercises:', error);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
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
            // First, ensure all exercise templates exist or create them
            const exercisesToAdd = [];
            
            for (const exercise of workoutData.exercises) {
                let templateId = exercise.templateId;
                
                // If no templateId provided, create a new template
                if (!templateId) {
                    const template = await exerciseTemplatesDB.createTemplate(
                        exercise.name,
                        exercise.exerciseType || exercise.targetMuscle || null,
                        exercise.subType || exercise.specificMuscle || null,
                        user.id
                    );
                    templateId = template.id;
                }
                
                // Count the number of sets to determine plannedSets
                const numSets = exercise.sets ? exercise.sets.length : exercise.targetSets || exercise.sets || 3;
                
                exercisesToAdd.push({
                    templateId: templateId,
                    plannedSets: numSets,
                    plannedReps: exercise.targetReps || exercise.reps || '10',
                    notes: exercise.notes || null
                });
            }

            // Create the workout (no longer storing exercises in JSONB)
            const newWorkout = await my_workoutsDB.addWorkout(
                user.id,
                user.user_name,
                workoutData.workoutName,
                null, // No exercises in JSONB anymore
                workoutData.restTime
            );

            // Link exercises to the workout via workout_exercises table
            await workoutExercisesDB.addExercisesToWorkout(
                newWorkout.id,
                user.id,
                exercisesToAdd
            );

            console.log('Workout saved:', newWorkout);
            res.status(200).json({ 
                success: true, 
                message: 'Workout created successfully',
                workoutId: newWorkout.id
            });
        } catch (error) {
            console.error('Error saving workout:', error);
            res.status(500).json({ success: false, message: 'Error creating workout' });
        }

    }
});

module.exports = router;