express = require('express');
var router = express.Router();
const { userDB } = require('../database/db');
const { my_workoutsDB } = require('../database/db');
const { exerciseDB } = require('../database/db');

// ---- Edit Workout Router ---- //

router.post('/', async function(req, res, next)  {
    const workoutID = req.body.workoutID;
    const username = await userDB.getUserByName(req.session.username);

    console.log("Received request to edit workout ID: " + workoutID);
    if(!workoutID) {
        return res.status(400).json({ success: false, message: workoutID + ' is an Invalid Workout ID' });
    }
    else
    {
        const myWorkout = await my_workoutsDB.getWorkoutById(workoutID);

        if(!myWorkout) {
            return res.status(404).json({ success: false, message: 'Workout not found' });
        }

        const exercises = [];
        let needsUpdate = false;

        for (const ex of myWorkout.exercises) {
            let uuid = ex.uuid;
            let isAuthenticated = ex.isAuthenticated;

            // If exercise doesn't have a UUID, create it in the exercise table
            if (!uuid) {
                try {
                    const createdExercise = await exerciseDB.createExercise(
                        ex.name,
                        ex.exerciseType || null,
                        ex.subtype || null
                    );
                    uuid = createdExercise.uuid;
                    isAuthenticated = createdExercise.isAuthenticated;
                    needsUpdate = true;
                    console.log('Created exercise:', createdExercise);
                    console.log('UUID from created exercise:', uuid);
                } catch (error) {
                    console.error('Error creating exercise:', error);
                    // Continue without UUID if creation fails
                }
            }

            exercises.push({
                workoutname: myWorkout.workout_name,
                workoutID: myWorkout.id,
                name: ex.name,
                sets: ex.sets,
                subtype: ex.subType,
                targetReps: ex.targetReps,
                exerciseType: ex.exerciseType,
                authenticated: ex.authenticated,
                uuid: uuid,
                isAuthenticated: isAuthenticated
            });
        }

        console.log('Exercises before rendering:', exercises);

        // Update workout with UUIDs if they were missing
        if (needsUpdate) {
            const updatedExercises = exercises.map(ex => ({
                name: ex.name,
                sets: ex.sets,
                subType: ex.subtype,
                targetReps: ex.targetReps,
                exerciseType: ex.exerciseType,
                authenticated: ex.authenticated,
                uuid: ex.uuid,
                isAuthenticated: ex.isAuthenticated
            }));
            await my_workoutsDB.updateWorkoutById(workoutID, myWorkout.workout_name, updatedExercises, myWorkout.rest_time);
        }

        myWorkout.exercises = exercises;

        console.log("Workout found: ", myWorkout);
        res.render('editWorkouts', {
            title: 'Edit Workout',
            myWorkout: myWorkout,
            user: username
        });
    }
});



router.post('/edit', async function(req, res, next)  {
    const workoutID = req.body.workoutID;
    const workoutName = req.body.workoutName;
    const restTime = req.body.restTime;
    const exercises = req.body.exercises; // Expecting an array of exercises with their details

    console.log("Received request to update workout ID: " + workoutID);

    if(!workoutID || !workoutName || !exercises) {
        return res.status(400).json({ success: false, message: 'Invalid input data' });
    }
    
    try {
        const myWorkout = await my_workoutsDB.getWorkoutById(workoutID);
        if(!myWorkout) {
            return res.status(404).json({ success: false, message: 'Workout not found' });
        }
        
        // Update workout details
        myWorkout.workout_name = workoutName;
        myWorkout.rest_time = restTime || 0;
        myWorkout.exercises = exercises.map(ex => ({
            name: ex.name,
            sets: ex.sets,
            subType: ex.subtype,
            targetReps: ex.targetReps,
            exerciseType: ex.exerciseType,
            authenticated: ex.authenticated
        }));
        await my_workoutsDB.updateWorkoutById(workoutID, workoutName, myWorkout.exercises, restTime || 0);
        console.log("Workout updated successfully: ", myWorkout);
        return res.status(200).json({ success: true, message: 'Workout updated successfully' });
    } catch (error) {
        console.error("Error updating workout:", error);
        return res.status(500).json({ success: false, message: 'Error updating workout: ' + error.message });
    }
});
module.exports = router;