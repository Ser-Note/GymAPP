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
    }
}

module.exports = userDB;