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
    async addWorkout(userID, username, workoutName, exercises, restTime) {
        const { data, error } = await supabase
            .from('my_workouts')
            .insert([{ user_id: userID, username: username, workout_name: workoutName, exercises: exercises, rest_time: restTime }])
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
    }
};


module.exports = { userDB, my_workoutsDB };