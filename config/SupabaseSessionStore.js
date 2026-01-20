const session = require('express-session');
const supabase = require('./supabase');

class SupabaseSessionStore extends session.Store {
  constructor(options = {}) {
    super();
    this.supabase = options.supabase || supabase;
    this.tableName = options.tableName || 'sessions';
    this.ttl = options.ttl || 24 * 60 * 60 * 1000; // default 24 hours
    this.debug = process.env.DEBUG_SESSIONS === '1';
  }

  _formatSupabaseError(op, sid, error) {
    const code = error && error.code ? error.code : undefined;
    const message = error && error.message ? error.message : String(error);
    const details = error && error.details ? error.details : undefined;
    const hint = error && error.hint ? error.hint : undefined;
    const msg = [`Supabase session store ${op} error`, sid ? `sid=${sid}` : null, code ? `code=${code}` : null, message ? `message=${message}` : null, details ? `details=${details}` : null, hint ? `hint=${hint}` : null]
      .filter(Boolean)
      .join(' | ');
    return new Error(msg);
  }

  async get(sid, callback) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('sess')
        .eq('sid', sid)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        if (this.debug) console.error('Supabase get error:', { sid, error });
        return callback(this._formatSupabaseError('get', sid, error));
      }
      // No session found
      if (!data) return callback(null, null);

      // Return the JSON session object
      return callback(null, data.sess || null);
    } catch (err) {
      if (this.debug) console.error('Supabase get catch:', { sid, err });
      return callback(this._formatSupabaseError('get', sid, err));
    }
  }

  async set(sid, sess, callback) {
    try {
      const expires = this._computeExpiry(sess);
      const payload = { sid, sess: sess, expire: expires.toISOString() };

      const { error } = await this.supabase
        .from(this.tableName)
        .upsert([payload], { onConflict: 'sid' });

      if (error) {
        if (this.debug) console.error('Supabase set error:', { sid, error });
        return callback(this._formatSupabaseError('set', sid, error));
      }
      if (this.debug) console.log('Supabase set ok:', { sid });
      return callback(null);
    } catch (err) {
      if (this.debug) console.error('Supabase set catch:', { sid, err });
      return callback(this._formatSupabaseError('set', sid, err));
    }
  }

  async destroy(sid, callback) {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('sid', sid);

      if (error) {
        if (this.debug) console.error('Supabase destroy error:', { sid, error });
        return callback(this._formatSupabaseError('destroy', sid, error));
      }
      return callback(null);
    } catch (err) {
      if (this.debug) console.error('Supabase destroy catch:', { sid, err });
      return callback(this._formatSupabaseError('destroy', sid, err));
    }
  }

  async touch(sid, sess, callback) {
    try {
      const expires = this._computeExpiry(sess);
      const { error } = await this.supabase
        .from(this.tableName)
        .update({ expire: expires.toISOString(), sess: sess })
        .eq('sid', sid);

      if (error) {
        if (this.debug) console.error('Supabase touch error:', { sid, error });
        return callback(this._formatSupabaseError('touch', sid, error));
      }
      return callback(null);
    } catch (err) {
      if (this.debug) console.error('Supabase touch catch:', { sid, err });
      return callback(this._formatSupabaseError('touch', sid, err));
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
