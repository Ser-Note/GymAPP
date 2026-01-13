express = require('express');
var router = express.Router();
const { userDB } = require('../database/db');
const { my_workoutsDB } = require('../database/db');

// ---- Edit Workout Router ---- //

router.get('/:workoutId', async function(req, res, next)  {
    if(!req.session || !req.session.username)
    {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    else
    {
        const user = await userDB.getUserByName(req.session.username);
        const workoutId = req.params.workoutId;
        const workout = await my_workoutsDB.getWorkoutById(workoutId);
        if (!workout || workout.user_id !== user.id) {
            return res.status(404).json({ success: false, message: 'Workout not found' });
        }
        res.render('editWorkouts', {
            title: 'Edit Workout',
            user: user,
            workout: workout
        });
    }
});

module.exports = router;