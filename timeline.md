# Gym App Development Timeline

## January 17, 2026

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
