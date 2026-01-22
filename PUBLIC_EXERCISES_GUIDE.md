# Public Exercises System - Implementation Guide

## Overview
The `exercise_templates` table has an `is_public` field that controls whether an exercise can be shared and reused across the entire platform.

---

## Current Logic & Architecture

### 1. **Exercise Template Creation** (`database/db.js`)

When a user creates a new workout with a new exercise:
```javascript
async createTemplate(exerciseName, targetMuscle, specificMuscle, userId = null) {
    // Creates template with is_public: false (private by default)
    const { data, error } = await supabase
        .from('exercise_templates')
        .insert([{
            exercise_name: exerciseName,
            target_muscle: targetMuscle,
            specific_muscle: specificMuscle,
            created_by_user_id: userId,
            is_public: false  // ← All new exercises start as PRIVATE
        }])
}
```

**Key Point:** Every new exercise template is created as **private by default** and can only be used by the user who created it.

---

### 2. **Fetching Available Templates** (`database/db.js`)

```javascript
async getAvailableTemplates(userId = null) {
    let query = supabase
        .from('exercise_templates')
        .select('*')
        .order('exercise_name', { ascending: true });

    if (userId) {
        // User logged in: Get PUBLIC exercises + their OWN exercises
        query = query.or(`is_public.eq.true,created_by_user_id.eq.${userId}`);
    } else {
        // User not logged in: Get only PUBLIC exercises
        query = query.eq('is_public', true);
    }
}
```

**Logic:**
- **Logged-in user:** Sees all public exercises + their own private exercises
- **Public user:** Sees only public exercises

---

### 3. **Making Exercises Public** (`database/db.js`)

```javascript
async updateTemplateStatus(templateId, isPublic) {
    // Admin-only operation to approve/publish exercises
    const { data, error } = await supabase
        .from('exercise_templates')
        .update({ is_public: isPublic })
        .eq('id', templateId)
}
```

**Current State:** Only admins can make exercises public (not yet exposed in UI).

---

## How Users Add Exercises to Workouts

### Current Workflow:
1. User goes to "Create Workout"
2. Types exercise name (e.g., "Bench Press")
3. If no matching **public** template exists, a **new private template is created**
4. Exercise is added to their workout via `workout_exercises` table

### Code Flow (backCreateWorkout.js):
```javascript
for (const exercise of workoutData.exercises) {
    let templateId = exercise.templateId;
    
    if (!templateId) {
        // Create new private template for this user
        const template = await exerciseTemplatesDB.createTemplate(
            exercise.name,
            exercise.exerciseType || exercise.targetMuscle,
            exercise.subType || exercise.specificMuscle,
            user.id  // ← Creates private to this user
        );
        templateId = template.id;
    }
    
    exercisesToAdd.push({
        templateId: templateId,
        plannedSets: numSets,
        plannedReps: exercise.plannedReps,
        notes: exercise.notes
    });
}
```

---

## What's Missing: Public Exercise Discovery & Usage

Currently, the system has the **database structure** for public exercises but **lacks the UI/UX** for users to:

1. **Discover public exercises** - Browse a library of pre-made exercises
2. **Request exercises to be public** - Ask admins to approve their exercise
3. **Use public exercises in workouts** - Select from library instead of creating new ones

---

## Recommended Implementation

### Option A: Create a "Browse Exercises" Page

**New Route:** `GET /exercises/browse`
- Fetch `getAvailableTemplates(userId)`
- Display public exercises + user's own exercises
- Allow users to select an exercise to add to workout

**New Frontend:**
- Exercise browser/search interface
- Filter by muscle group
- "Add to Workout" button

**Modified backCreateWorkout.js:**
- Accept `exercise.templateId` from frontend instead of creating new template
- Only create new template if user explicitly chooses "Create Custom"

---

### Option B: Add Admin Approval UI

**New Route:** `GET /admin/templates`
- List all user-created templates
- Show `is_public` status
- Admin can approve/reject to make public

**Use Case:**
- Users create exercises
- Admins review and approve popular ones
- Approved exercises become available to all users

---

### Option C: Full Recommendation System

**Add to database:**
```javascript
// Track which exercises users want made public
async requestPublicStatus(templateId, reason) {
    // Store request for admin review
}

// Track usage statistics
async trackTemplateUsage(templateId) {
    // Count how many users have used this exercise
}
```

This would allow admins to see which community exercises are most popular and approve high-demand ones.

---

## Implementation Roadmap

**Phase 1 (Quick Win):**
- Create exercise browser page with search/filter
- Let users select from public + their own exercises when creating workouts
- Add "Create Custom Exercise" as fallback

**Phase 2 (Enhancement):**
- Add admin panel to approve/reject exercises
- Let users request their exercises be made public
- Show exercise popularity stats

**Phase 3 (Advanced):**
- Muscle group highlighting (already in your code!)
- Exercise recommendations based on workout type
- Community ratings for exercises

---

## Current State Summary

| Feature | Status |
|---------|--------|
| Database structure for `is_public` | ✅ Complete |
| Private exercise creation | ✅ Complete |
| Admin approval method | ✅ Complete |
| User-facing discovery UI | ❌ Missing |
| Exercise browser/search | ❌ Missing |
| Public exercise selection in workout creation | ❌ Missing |
| Request public status UI | ❌ Missing |
| Admin approval dashboard | ❌ Missing |

---

## Code Reference Points

- Database logic: [database/db.js](database/db.js#L235-L297) (exerciseTemplatesDB)
- Workout creation: [routes/backCreateWorkout.js](routes/backCreateWorkout.js)
- Create workout UI: [views/createWorkouts.hbs](views/createWorkouts.hbs)
- Create workout logic: [public/js/frontCreateWorkout.js](public/js/frontCreateWorkout.js)

