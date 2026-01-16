# Gym App Development Timeline

## January 17, 2026

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
