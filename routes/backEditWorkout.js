express = require('express');
var router = express.Router();
const { userDB } = require('../database/db');
const { my_workoutsDB } = require('../database/db');

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
        myWorkout.exercises.forEach(ex => {
            exercises.push({
                workoutname: myWorkout.workout_name,
                workoutID: myWorkout.id,
                name: ex.name,
                sets: ex.sets,                    // Array of {id, reps, weight, setNumber}
                subtype: ex.subType,              // Note: subType (capital T)
                targetReps: ex.targetReps,
                exerciseType: ex.exerciseType,
                authenticated: ex.authenticated
            });
        });

        myWorkout.exercises = exercises;

        console.log("Workout found: ", myWorkout);
        res.render('editWorkouts', {
            title: 'Edit Workout',
            myWorkout: myWorkout,
            user: username
        });
    }
});

module.exports = router;