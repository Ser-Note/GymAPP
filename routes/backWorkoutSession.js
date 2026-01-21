var express = require('express');
var router = express.Router();
const { userDB, workoutSessionsDB, exerciseLogsDB, workoutExercisesDB } = require('../database/db');

// ---- Start a Workout Session ---- //
router.post('/start', async function(req, res, next) {
    try {
        if(!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { workoutId, notes } = req.body;
        if (!workoutId) {
            return res.status(400).json({ success: false, message: 'Workout ID required' });
        }

        const user = await userDB.getUserByName(req.session.username);
        const session = await workoutSessionsDB.startSession(workoutId, user.id, notes);

        return res.status(200).json({ 
            success: true, 
            message: 'Workout session started',
            session: session
        });
    } catch (err) {
        console.error('Error starting workout session:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ---- Log an Exercise Set ---- //
router.post('/logSet', async function(req, res, next) {
    try {
        if(!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { sessionId, workoutExerciseId, setNumber, reps, weight, notes } = req.body;
        
        if (!sessionId || !workoutExerciseId || setNumber === undefined || reps === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const log = await exerciseLogsDB.logSet(
            sessionId,
            workoutExerciseId,
            setNumber,
            reps,
            weight || 0,
            notes
        );

        return res.status(200).json({ 
            success: true, 
            message: 'Set logged successfully',
            log: log
        });
    } catch (err) {
        console.error('Error logging set:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ---- Get Last Performance for an Exercise ---- //
router.get('/lastPerformance', async function(req, res, next) {
    try {
        if(!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { workoutExerciseId } = req.query;
        if (!workoutExerciseId) {
            return res.status(400).json({ success: false, message: 'Workout exercise ID required' });
        }

        const user = await userDB.getUserByName(req.session.username);
        const lastPerformance = await exerciseLogsDB.getLastPerformance(workoutExerciseId, user.id);

        return res.status(200).json({ 
            success: true, 
            lastPerformance: lastPerformance
        });
    } catch (err) {
        console.error('Error fetching last performance:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ---- Complete a Workout Session ---- //
router.post('/complete', async function(req, res, next) {
    try {
        if(!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ success: false, message: 'Session ID required' });
        }

        const completedSession = await workoutSessionsDB.completeSession(sessionId);

        return res.status(200).json({ 
            success: true, 
            message: 'Workout session completed',
            session: completedSession
        });
    } catch (err) {
        console.error('Error completing workout session:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ---- Get User's Workout History ---- //
router.get('/history', async function(req, res, next) {
    try {
        if(!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const user = await userDB.getUserByName(req.session.username);
        const sessions = await workoutSessionsDB.getUserSessions(user.id, limit);

        return res.status(200).json({ 
            success: true, 
            sessions: sessions
        });
    } catch (err) {
        console.error('Error fetching workout history:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ---- Get Session Details with Logs ---- //
router.get('/session/:sessionId', async function(req, res, next) {
    try {
        if(!req.session || !req.session.username) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { sessionId } = req.params;
        const session = await workoutSessionsDB.getSessionById(sessionId);
        
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const logs = await exerciseLogsDB.getSessionLogs(sessionId);

        return res.status(200).json({ 
            success: true, 
            session: session,
            logs: logs
        });
    } catch (err) {
        console.error('Error fetching session details:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
