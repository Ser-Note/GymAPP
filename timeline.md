# Gym App Development Timeline

## January 21, 2026

### Database Schema Redesign: Normalized Exercise & Session Tracking
- **Replaced flat exercise table** with normalized structure for exercise progress tracking
- **New tables created**:
  - `exercise_templates` - Master exercise definitions (replaces old exercise table)
  - `workout_exercises` - Junction table linking exercises to specific workouts with set/rep config
  - `workout_sessions` - Records each time a user starts a workout
  - `exercise_logs` - Logs individual sets with reps, weight, notes
- **RLS (Row Level Security)** policies added to all tables for data isolation
- **Solves**:
  - Users can now use same exercise in multiple workouts with different set/rep counts
  - Complete exercise performance history with last performance lookup
  - Easier admin exercise approval via `is_public` field
  - Supports progressive overload tracking across all workouts

### Backend Route Updates
- **`backCreateWorkout.js`** - Creates exercise templates on-demand, links via `workout_exercises`
- **`backMyWorkouts.js`** - Fetches workouts with exercise joins, supports both new/legacy structures
- **`backEditWorkout.js`** - Updated to use `exerciseTemplatesDB`, fixed logging typo
- **`backAdminEditDash.js`** - Updated to use `exerciseTemplatesDB.updateTemplateStatus()`
- **`backWorkoutSession.js`** (new) - 6 endpoints for session management:
  - POST `/workoutSession/start` - Begin workout
  - POST `/workoutSession/logSet` - Log completed set
  - GET `/workoutSession/lastPerformance` - Get previous performance
  - POST `/workoutSession/complete` - End workout
  - GET `/workoutSession/history` - User's workout history
  - GET `/workoutSession/session/:id` - Detailed session with all logs
- **`server.js`** - Registered new workoutSessionRouter

### Database Layer (db.js)
- **Added 4 new DB operation objects**:
  - `exerciseTemplatesDB` - Template CRUD + public status updates
  - `workoutExercisesDB` - Exercise-workout linking + fetching with joins
  - `workoutSessionsDB` - Session lifecycle management
  - `exerciseLogsDB` - Set logging + performance history queries
- **Updated `addWorkout()`** - Now includes `uses_new_structure` flag for backward compatibility
- **Backward compatibility** - Old `exerciseDB` kept as compatibility layer

### Field Name Handling
- Updated `backCreateWorkout.js` to handle both field naming conventions:
  - `exerciseType` / `targetMuscle` (frontend)
  - `targetMuscle` / `specificMuscle` (database)
- Set counting fixed to count `exercise.sets.length` instead of using fallback values

## January 17, 2026


### Added Admin Exercise Authentication System
- **Created exercise database table** with fields: uuid (id), exercise, targetMuscle, specificMuscle, isAuthenticated, created_at
- **Exercise creation flow**:
  - When users create workouts, exercises are automatically created in exercise table with UUID
  - When editing old workouts without UUIDs, exercises are created on-demand and workouts updated
- **Admin authentication buttons** on edit workouts page:
  - Only visible to admin users (`{{#if ../user.isAdmin}}`)
  - Buttons show current status: "✓ Authenticated" or "✗ Pending"
  - Toggle status with single click
  - Real-time UI update without page reload
- **Backend**: POST endpoint `/adminEditDash/authenticateExercise` validates admin privileges and updates exercise table
- **Database operations**: Added exerciseDB with methods for create, authenticate, and retrieve exercises
- **Files Created/Modified**: 
  - `db.js` - Added exerciseDB with CRUD operations
  - `backCreateWorkout.js` - Creates exercises with UUIDs on workout creation
  - `backEditWorkout.js` - Creates missing exercise UUIDs on first edit
  - `backAdminEditDash.js` - Added authenticateExercise endpoint
  - `editWorkouts.hbs` - Added admin auth buttons to exercise section
  - `frontEditWorkout.js` - Added authentication button click handler

### Added Admin Edit Dashboard Feature
- **Admins can edit any user's workouts** from Manage Users page
- **Created new route** `/adminEditDash` with GET and POST handlers
- **Edit Workout button** on user cards sends username to backend
- **Admin dashboard displays target user's workouts** with delete functionality
- **Same edit interface** as personal workouts but for admin to manage other users
- **Files Created/Modified**:
  - Created `backAdminEditDash.js` - Backend routes for admin edit dashboard
  - Created `frontAdminEditDash.js` - Frontend logic for delete buttons
  - Created `adminEditDashboard.hbs` - View template for admin edit page
  - Modified `backManageUsers.js` - Added POST endpoint for `/manageUsers/editWorkouts`
  - Modified `frontManageUsers.js` - Updated edit button to redirect properly
  - Modified `server.js` - Registered `/adminEditDash` route

### Fixed createWorkout.css Scrolling Issue
- **Added bottom padding** to `.info` container to prevent navbar from blocking submit/clear buttons
- **Issue**: Fixed navbar at bottom was blocking access to form buttons on mobile
- **Solution**: Added `padding-bottom: 120px` to create space for fixed navbar

### Fixed theme.js Error
- **Issue**: TypeError - Cannot read properties of null (reading 'style')
- **Root Cause**: Code tried to access `.style` on non-existent `winterBear` element
- **Solution**: Added null checks before accessing element properties
- **Added graceful fallback**: Feature skips winter bear animation if element doesn't exist
- **Files Modified**: `theme.js`

### Added Seasonal Themes
- **Implemented four seasonal themes** that change automatically based on current month:
  - **Winter** (Jan, Nov, Dec): Falling snowflakes with polar bear mascot waving animation
  - **Flowers** (Feb, Mar, Apr): Falling flower petals (🌸)
  - **Summer** (May, Jun, Jul): Sun graphic display
  - **Fall** (Aug, Sep, Oct): Falling maple leaves with decorative maple leaf images
- **Theme detection**: Uses Eastern Time to determine current month and applies theme
- **Files Modified**: `theme.js`, `theme.css`

### Added Delete Workout Button with Confirmation
- **Added delete button** on edit dashboard page (one per workout in list)
- **Confirmation dialog** appears to prevent accidental deletion
  - Shows workout name in confirmation message
  - Confirms deletion cannot be undone
- **Fixed ID conflicts**: Changed from `id` to `class` for delete button and workoutID input (multiple buttons in loop)
- **Frontend implementation**: Uses event delegation with `querySelectorAll` to handle all delete buttons
- **Backend implementation**: POST endpoint at `/editDashboard/delete` with error handling
- **Bug fix**: Updated editDashboard.hbs to load correct script (frontEditDash.js instead of frontEditWorkout.js)
- **Files Modified**: `editDashboard.hbs`, `frontEditDash.js`, `backEditDash.js`

### Added Target Reps and Rest Time Fields to Edit Workout
- **Added target reps input** for each exercise (displayed before sets section)
- **Added rest time input** for workout (displayed after workout name, value in seconds)
- **Fixed form submission issues**:
  - Added hidden `workoutID` input field
  - Corrected form action and fetch URL from `/edit` to `/editWorkouts/edit`
  - Fixed `updateWorkoutById()` function call with proper parameters
  - Added try-catch error handling in backend POST handler
- **Files Modified**: `editWorkouts.hbs`, `frontEditWorkout.js`, `backEditWorkout.js`

### Tab-Based Exercise View & Form Data Fixes
- **Implemented tab navigation** for edit workouts page to reduce scrolling on mobile
  - Converted from stacked card layout to horizontal tabs with scrollable content
  - Add button positioned below tabs on mobile
  
- **Fixed form data structure** with indexed input names for proper server parsing
  - Changed to `exerciseName[index]`, `reps[exerciseIndex][setIndex]`, `weight[exerciseIndex][setIndex]`
  
- **Fixed JavaScript event handling** - rewrote to use event delegation
  - Resolved issue where adding first new exercise created duplicates
  - Old listeners on button were firing alongside new logic
  - All handlers now use document event delegation
  - Replaced `insertBefore` with `appendChild` since button no longer direct child
  - Used `cloneNode` to ensure single listener on add button
  
- **Files Modified**: `editWorkouts.hbs`, `editWorkout.css`, `frontEditWorkout.js`

## January 16, 2026

### Fixed Navbar Inconsistency on Profile & Manage Users Pages (Mobile)
- Resolved navbar sizing, spacing, and positioning inconsistencies
- Added proper `box-sizing: border-box` and HTML5 document structure
- Standardized navbar styling and isolated CSS variables
- Ensured consistent font families and icon sizing

## January 15, 2026

### Fixed Navbar Inconsistency on Profile & Manage Users Pages (Mobile)
- **Issues**: Navbar expanded on profile page, button accessibility issues, inconsistent spacing
- **Root Causes**: Missing `box-sizing: border-box`, missing HTML5 structure, duplicate navbar styles, font inconsistencies
- **Solutions**: Added box-sizing, fixed HTML5 structure, removed duplicates, standardized fonts, reduced navbar icon sizes
- **Result**: Consistent navbar styling across all pages with proper scrolling past fixed navbar
