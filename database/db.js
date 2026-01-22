const supabase = require('../config/supabase');

// ---- User Operations ---- //

const userDB = {
    // -- Get All Users -- //

    async getAllUsers() {
        const { data, error } = await supabase
            .from('user')
            .select('*')
            .order('user_name', { ascending: true });

            if (error) throw error;
            return data || [];
    },

    async getUserByName(username) {
        const { data, error } = await supabase
            .from('user')
            .select('*')
            .eq('user_name', username)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return data || null;
    },

    async login(username, password) {
        const { data, error } = await supabase
            .from('user')
            .select('*')
            .eq('user_name', username)
            .eq('password', password)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error; // ignore no-match
        return data || null;
    },


    async register(username, password) {
        const { data, error } = await supabase
            .from('user')
            .insert([{ user_name: username, password: password, isAuthenticated: false, isAdmin: false }])
            .select()
            .single();
        if (error) throw error;
        return data || null;
    },

    async getIsAuthenticated(username) {
        const { data, error } = await supabase
            .from('user')
            .select('isAuthenticated')
            .eq('user_name', username)
            .maybeSingle();
        if (error && error.code !== 'PGRST116') throw error; // ignore no-match
        return data ? data.isAuthenticated : null;
    },

    async setIsAuthenticated(username, isAuthenticated) {
        const { data, error } = await supabase
            .from('user')
            .update({ isAuthenticated: isAuthenticated })
            .eq('user_name', username)
            .select()
            .single();
        if (error) throw error;
        return data || null;
    },

    async getIsAdmin(username) {
        const { data, error } = await supabase
            .from('user')
            .select('isAdmin')
            .eq('user_name', username)
            .maybeSingle();
        if (error && error.code !== 'PGRST116') throw error; // ignore no-match
        return data ? data.isAdmin : null;
    },

    async setIsAdmin(username, isAdmin) {
        const { data, error } = await supabase
            .from('user')
            .update({ isAdmin: isAdmin })
            .eq('user_name', username)
            .select()
            .single();
        if (error) throw error;
        return data || null;
    },

    async deleteUser(username) {
        const {data, error } = await supabase
            .from('user')
            .delete()
            .eq('user_name', username)
            .select()
            .single();
        if (error) throw error;
        return data || null;
    },

    async updateUsername(oldUsername, newUsername) {
        const { data, error } = await supabase
            .from('user')
            .update({ user_name: newUsername })
            .eq('user_name', oldUsername)
            .select()
            .single();
        if (error) throw error;
        return data || null;
    },

    async updatePassword(username, newPassword) {
        const { data, error } = await supabase
            .from('user')
            .update({ password: newPassword })
            .eq('user_name', username)
            .select()
            .single();
        if (error) throw error;
        return data || null;
    }

};

const my_workoutsDB = {
    // -- Get Workouts by Username -- //
    async getWorkoutsByUsername(username) {
        const { data, error } = await supabase
            .from('my_workouts')
            .select('*')
            .eq('username', username)

        if (error) throw error;
        return data || [];
    },

    // -- Add New Workout -- //
    async addWorkout(userID, username, workoutName, exercises, restTime, usesNewStructure = true) {
        const { data, error } = await supabase
            .from('my_workouts')
            .insert([{ 
                user_id: userID, 
                username: username, 
                workout_name: workoutName, 
                exercises: exercises, 
                rest_time: restTime,
                uses_new_structure: usesNewStructure
            }])
            .select()
            .single();
        if (error) throw error;
        return data || null;
    },

    // -- Delete Workout by ID -- //
    async deleteWorkoutById(workoutId) {
        const { data, error } = await supabase
            .from('my_workouts')
            .delete()
            .eq('id', workoutId)
            .select()
            .single();
        if (error) throw error;
        return data || null;
    },

    async lastWorkoutID(username) {
        const { data, error } = await supabase
            .from('my_workouts')
            .select('workout_id')
            .eq('username', username)
            .order('workout_id', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error && error.code !== 'PGRST116') throw error; // ignore no-match
        return data ? data.workout_id : null;
    },
    async getWorkoutById(workoutId) {
        const { data, error } = await supabase
            .from('my_workouts')
            .select('*')
            .eq('id', workoutId)
            .maybeSingle();
        if (error && error.code !== 'PGRST116') throw error; // ignore no-match
        return data || null;
    },

    async updateWorkoutById(workoutId, workoutName, exercises, restTime) {
        const { data, error } = await supabase
            .from('my_workouts')
            .update({ workout_name: workoutName, exercises: exercises, rest_time: restTime })
            .eq('id', workoutId)
            .select()
            .single();
        if (error) throw error;
        return data || null;
    },

    async deleteWorkoutById(workoutId) {
        const { data, error } = await supabase
            .from('my_workouts')
            .delete()
            .eq('id', workoutId)
            .select()
            .single();
        if (error) throw error;
        return data || null;
    },
    async getExerciseByUuid(exerciseUuid) {
        const { data, error } = await supabase
            .from('my_workouts')
            .select('exercises');
        if (error && error.code !== 'PGRST116') throw error; // ignore no-match
        
        // Filter client-side to find the matching exercise
        if (data) {
            for (const workout of data) {
                if (workout.exercises && Array.isArray(workout.exercises)) {
                    const foundExercise = workout.exercises.find(ex => ex.uuid === exerciseUuid);
                    if (foundExercise) {
                        return { exercises: [foundExercise] };
                    }
                }
            }
        }
        return null;
    }
};


// ---- Exercise Template Operations ---- //
const exerciseTemplatesDB = {
    // Get all public templates or user's own templates
    async getAvailableTemplates(userId = null) {
        let query = supabase
            .from('exercise_templates')
            .select('*')
            .order('exercise_name', { ascending: true });

        if (userId) {
            query = query.or(`is_public.eq.true,created_by_user_id.eq.${userId}`);
        } else {
            query = query.eq('is_public', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    // Create new exercise template
    async createTemplate(exerciseName, targetMuscle, specificMuscle, userId = null) {
        const { data, error } = await supabase
            .from('exercise_templates')
            .insert([{
                exercise_name: exerciseName,
                target_muscle: targetMuscle,
                specific_muscle: specificMuscle,
                created_by_user_id: userId,
                is_public: false
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get template by ID
    async getTemplateById(templateId) {
        const { data, error } = await supabase
            .from('exercise_templates')
            .select('*')
            .eq('id', templateId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    },

    // Get all pending exercises (private, not yet approved)
    async getPendingExercises() {
        const { data, error } = await supabase
            .from('exercise_templates')
            .select('id, exercise_name, target_muscle, specific_muscle, created_by_user_id, is_public, created_at, user(user_name)')
            .eq('is_public', false)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Update template authentication/public status (admin only)
    async updateTemplateStatus(templateId, isPublic) {
        const { data, error } = await supabase
            .from('exercise_templates')
            .update({ is_public: isPublic })
            .eq('id', templateId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// ---- Workout Exercises Operations ---- //
const workoutExercisesDB = {
    // Add exercises to a workout
    async addExercisesToWorkout(workoutId, userId, exercises) {
        const exercisesToInsert = exercises.map((ex, index) => ({
            workout_id: workoutId,
            user_id: userId,
            exercise_template_id: ex.templateId,
            order_in_workout: index + 1,
            planned_sets: ex.plannedSets || 3,
            planned_reps: ex.plannedReps || '10',
            notes: ex.notes || null
        }));

        const { data, error } = await supabase
            .from('workout_exercises')
            .insert(exercisesToInsert)
            .select();

        if (error) throw error;
        return data;
    },

    // Get exercises for a workout with template details
    async getWorkoutExercises(workoutId, userId) {
        const { data, error } = await supabase
            .from('workout_exercises')
            .select(`
                *,
                exercise_templates (
                    id,
                    exercise_name,
                    target_muscle,
                    specific_muscle
                )
            `)
            .eq('workout_id', workoutId)
            .eq('user_id', userId)
            .order('order_in_workout', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    // Update exercise configuration in workout
    async updateWorkoutExercise(workoutExerciseId, updates) {
        const { data, error } = await supabase
            .from('workout_exercises')
            .update(updates)
            .eq('id', workoutExerciseId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete exercise from workout
    async deleteWorkoutExercise(workoutExerciseId) {
        const { data, error } = await supabase
            .from('workout_exercises')
            .delete()
            .eq('id', workoutExerciseId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// ---- Workout Sessions Operations ---- //
const workoutSessionsDB = {
    // Start a new workout session
    async startSession(workoutId, userId, notes = null) {
        const { data, error } = await supabase
            .from('workout_sessions')
            .insert([{
                workout_id: workoutId,
                user_id: userId,
                started_at: new Date().toISOString(),
                notes: notes
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Complete a workout session
    async completeSession(sessionId) {
        const { data, error } = await supabase
            .from('workout_sessions')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', sessionId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get user's workout history
    async getUserSessions(userId, limit = 10) {
        const { data, error } = await supabase
            .from('workout_sessions')
            .select(`
                *,
                my_workouts (
                    id,
                    workout_name
                )
            `)
            .eq('user_id', userId)
            .order('started_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    // Get session by ID
    async getSessionById(sessionId) {
        const { data, error } = await supabase
            .from('workout_sessions')
            .select('*')
            .eq('id', sessionId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    }
};

// ---- Exercise Logs Operations ---- //
const exerciseLogsDB = {
    // Log a set
    async logSet(sessionId, workoutExerciseId, setNumber, reps, weight, notes = null) {
        const { data, error } = await supabase
            .from('exercise_logs')
            .insert([{
                workout_session_id: sessionId,
                workout_exercise_id: workoutExerciseId,
                set_number: setNumber,
                reps_completed: reps,
                weight_used: weight,
                notes: notes
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get logs for a session
    async getSessionLogs(sessionId) {
        const { data, error } = await supabase
            .from('exercise_logs')
            .select(`
                *,
                workout_exercises (
                    id,
                    exercise_templates (
                        exercise_name
                    )
                )
            `)
            .eq('workout_session_id', sessionId)
            .order('completed_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    // Get last performance for a specific exercise in a workout
    async getLastPerformance(workoutExerciseId, userId) {
        const { data, error } = await supabase
            .from('exercise_logs')
            .select(`
                *,
                workout_sessions!inner (
                    started_at,
                    user_id
                )
            `)
            .eq('workout_exercise_id', workoutExerciseId)
            .eq('workout_sessions.user_id', userId)
            .order('workout_sessions.started_at', { ascending: false })
            .limit(10);

        if (error) throw error;
        return data || [];
    },

    // Update a logged set
    async updateLog(logId, updates) {
        const { data, error } = await supabase
            .from('exercise_logs')
            .update(updates)
            .eq('id', logId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete a logged set
    async deleteLog(logId) {
        const { data, error } = await supabase
            .from('exercise_logs')
            .delete()
            .eq('id', logId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// ---- Legacy Exercise Operations (Keep for backward compatibility) ---- //
const exerciseDB = {
    // Redirect to new system
    async getAllExercises() {
        return exerciseTemplatesDB.getAvailableTemplates();
    },

    async getExercisesByAuthenticated(isAuthenticated) {
        const { data, error } = await supabase
            .from('exercise_templates')
            .select('*')
            .eq('is_public', isAuthenticated)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async createExercise(exerciseName, targetMuscle, specificMuscle = null) {
        return exerciseTemplatesDB.createTemplate(exerciseName, targetMuscle, specificMuscle);
    },

    async updateExerciseAuthentication(exerciseUuid, isAuthenticated, subType, exerciseType) {
        const { data, error } = await supabase
            .from('exercise_templates')
            .update({ 
                is_public: isAuthenticated, 
                specific_muscle: subType, 
                target_muscle: exerciseType 
            })
            .eq('id', exerciseUuid)
            .select()
            .single();

        if (error) throw error;
        return data || null;
    },

    async getExerciseByUuid(uuid) {
        return exerciseTemplatesDB.getTemplateById(uuid);
    }
};


module.exports = { 
    userDB, 
    my_workoutsDB, 
    exerciseDB,
    exerciseTemplatesDB,
    workoutExercisesDB,
    workoutSessionsDB,
    exerciseLogsDB
};