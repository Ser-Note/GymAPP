const session = require('express-session');
const supabase = require('./supabase');

class SupabaseSessionStore extends session.Store {
  constructor(options = {}) {
    super();
    this.supabase = options.supabase || supabase;
    this.tableName = options.tableName || 'session';
    this.ttl = options.ttl || 24 * 60 * 60 * 1000; // default 24 hours
  }

  async get(sid, callback) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('session')
        .eq('sid', sid)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') return callback(error);
      // No session found
      if (!data) return callback(null, null);

      // Return the JSON session object
      return callback(null, data.session || null);
    } catch (err) {
      return callback(err);
    }
  }

  async set(sid, sess, callback) {
    try {
      const expires = this._computeExpiry(sess);
      const payload = { sid, session: sess, expire: expires.toISOString() };

      const { error } = await this.supabase
        .from(this.tableName)
        .upsert([payload], { onConflict: 'sid' });

      if (error) return callback(error);
      return callback(null);
    } catch (err) {
      return callback(err);
    }
  }

  async destroy(sid, callback) {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('sid', sid);

      if (error) return callback(error);
      return callback(null);
    } catch (err) {
      return callback(err);
    }
  }

  async touch(sid, sess, callback) {
    try {
      const expires = this._computeExpiry(sess);
      const { error } = await this.supabase
        .from(this.tableName)
        .update({ expire: expires.toISOString(), session: sess })
        .eq('sid', sid);

      if (error) return callback(error);
      return callback(null);
    } catch (err) {
      return callback(err);
    }
  }

  _computeExpiry(sess) {
    // Use cookie.expires if provided; else fallback to now + ttl
    if (sess && sess.cookie && sess.cookie.expires) {
      const d = new Date(sess.cookie.expires);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date(Date.now() + this.ttl);
  }
}

module.exports = SupabaseSessionStore;
