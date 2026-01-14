
// ---- require modules ---- //

require('dotenv').config();
const express= require('express');
const path = require('path');
const axios = require('axios');
const session = require('express-session');

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

// ---- Initialize express ---- //

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false}
}));

// ---- View Engine Setup ---- //

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Register custom handlebars helpers
const hbs = require('hbs');
hbs.registerHelper('stringify', function(obj) {
    return JSON.stringify(obj);
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

// ---- Start Server ---- //

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})


