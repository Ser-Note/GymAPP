// ---- require modules ---- //

require('dotenv').config();
const express= require('express');
const path = require('path');
const axios = require('axios');
const session = require('express-session');
const supabase = require('./config/supabase');

// ---- Session Store for Vercel ---- //
class SupabaseSessionStore extends session.Store {
    async get(sid, callback) {
        try {
            console.log('Session Store: Retrieving session', sid);
            const { data, error } = await supabase
                .from('sessions')
                .select('sess')
                .eq('sid', sid)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.error('Session Store Error on get:', error);
                throw error;
            }
            if (data) {
                console.log('Session Store: Retrieved session data');
                callback(null, JSON.parse(data.sess));
            } else {
                console.log('Session Store: No session found');
                callback(null, null);
            }
        } catch (err) {
            console.error('Session Store Exception on get:', err);
            callback(err);
        }
    }

    async set(sid, sess, callback) {
        try {
            console.log('Session Store: Saving session', sid);
            const { error } = await supabase
                .from('sessions')
                .upsert(
                    {
                        sid: sid,
                        sess: JSON.stringify(sess),
                        expire: new Date(Date.now() + 24 * 60 * 60 * 1000)
                    },
                    { onConflict: 'sid' }
                );
            
            if (error) {
                console.error('Session Store Error on set:', error);
                throw error;
            }
            console.log('Session Store: Saved successfully');
            callback();
        } catch (err) {
            console.error('Session Store Exception:', err);
            callback(err);
        }
    }

    async destroy(sid, callback) {
        try {
            const { error } = await supabase
                .from('sessions')
                .delete()
                .eq('sid', sid);
            
            if (error) throw error;
            callback();
        } catch (err) {
            callback(err);
        }
    }
}

// ---- Initialize Routes ---- //

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/backLogin.js');
const registerRouter = require('./routes/backRegister.js');
const dashboardRouter = require('./routes/backDashboard.js');
const manageUsersRouter = require('./routes/backManageUsers.js');
const profileRouter = require('./routes/backProfile.js');
const myWorkoutRouter = require('./routes/backMyWorkouts.js');
const createWorkoutRouter = require('./routes/backCreateWorkout.js');
const editDashboardRouter = require('./routes/backEditDash.js');
const editWorkoutsRouter = require('./routes/backEditWorkout.js');
const adminEditDashRouter = require('./routes/backAdminEditDash.js');
const workoutRouter = require('./routes/backWorkingout.js');
// ---- Initialize express ---- //

const app = express();


app.set('trust proxy', 1);

app.use(session({
    store: new SupabaseSessionStore(),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// ---- View Engine Setup ---- //

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Register custom handlebars helpers
const hbs = require('hbs');
hbs.registerHelper('stringify', function(obj) {
    return JSON.stringify(obj);
});

hbs.registerHelper('gt', function(a, b) {
    return a > b;
});

hbs.registerHelper('isLast', function(index, length) {
    return index === length - 1;
});

hbs.registerHelper('and', function(a, b) {
    return a && b;
});

hbs.registerHelper('eq', function(a, b) {
    return a === b;
});

// ---- Body Parsing ---- //

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---- Serve Static Files ---- //

app.use(express.static(path.join(__dirname, 'public')));

// ---- Routes ---- //

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/dashboard', dashboardRouter);
app.use('/manageUsers', manageUsersRouter);
app.use('/profile', profileRouter);
app.use('/myWorkouts', myWorkoutRouter);
app.use('/createWorkouts', createWorkoutRouter);
app.use('/editDashboard', editDashboardRouter);
app.use('/editWorkouts', editWorkoutsRouter);
app.use('/adminEditDash', adminEditDashRouter);
app.use('/workingout', workoutRouter);
// ---- Start Server ---- //

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;