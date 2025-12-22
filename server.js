
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

// ---- Initialize express ---- //

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));


// ---- Body Parsing ---- //

app.use(express.urlencoded({ extended: true }));

// ---- View Engine Setup ---- //

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// ---- Serve Static Files ---- //

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ---- Routes ---- //

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/dashboard', dashboardRouter);
app.use('/manageUsers', manageUsersRouter);
app.use('/profile', profileRouter);
app.use('/exercises', myWorkoutRouter);

// ---- Start Server ---- //

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})


