// ===== Workout Execution Logic =====

// Reminders for the carousel
const reminders = [
    "Drink water to stay hydrated!",
    "Take a deep breath and relax",
    "Great work! You're crushing it!",
    "Stretch while you rest"
];

// State management
let currentWorkout = null;
let currentExerciseIndex = 0;
let currentSetIndex = 0;
let timerInterval = null;
let timeRemaining = 0;
let currentReminderIndex = 0;
let carouselInterval = null;

// DOM Elements
const exerciseScreen = document.getElementById('exerciseScreen');
const restScreen = document.getElementById('restScreen');
const weightScreen = document.getElementById('weightScreen');
const completeScreen = document.getElementById('completeScreen');

const exerciseName = document.getElementById('exerciseName');
const setCounter = document.getElementById('setCounter');
const exerciseWeight = document.getElementById('exerciseWeight');
const targetReps = document.getElementById('targetReps');
const actualRepsInput = document.getElementById('actualReps');

const timerDisplay = document.getElementById('timerDisplay');
const reminderText = document.getElementById('reminderText');
const nextBtn = document.getElementById('nextBtn');
const skipRestBtn = document.getElementById('skipRestBtn');
const completeSetBtn = document.getElementById('completeSetBtn');
const endWorkoutBtn = document.getElementById('endWorkoutBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeWorkout();
});

// Initialize workout
async function initializeWorkout() {
    try {
        // Get workout ID from URL query parameter
        const params = new URLSearchParams(window.location.search);
        const workoutId = params.get('id');

        if (!workoutId) {
            alert('Workout ID not found');
            window.location.href = '/myWorkouts';
            return;
        }

        const response = await fetch(`/myWorkouts/current?id=${workoutId}`);
        const data = await response.json();
        
        if (data.success && data.workout) {
            currentWorkout = data.workout;
            displayExercise();
        } else {
            alert('Failed to load workout');
            window.location.href = '/myWorkouts';
        }
    } catch (err) {
        console.error('Error loading workout:', err);
        alert('Unable to load workout');
        window.location.href = '/myWorkouts';
    }
}

// Display current exercise
function displayExercise() {
    const exercise = currentWorkout.exercises[currentExerciseIndex];
    const set = exercise.sets[currentSetIndex];

    exerciseName.textContent = exercise.name;
    setCounter.textContent = `Set ${currentSetIndex + 1} of ${exercise.sets.length}`;
    exerciseWeight.textContent = `${set.weight} lbs`;
    targetReps.textContent = exercise.targetReps;
    actualRepsInput.value = '';
    actualRepsInput.focus();

    showScreen('exerciseScreen');
}

// Complete a set
completeSetBtn.addEventListener('click', () => {
    const actualReps = parseInt(actualRepsInput.value) || 0;
    
    if (actualReps < 0) {
        alert('Please enter a valid number of reps');
        return;
    }

    const exercise = currentWorkout.exercises[currentExerciseIndex];
    const set = exercise.sets[currentSetIndex];
    set.completedReps = actualReps;

    // Start rest timer
    startRestTimer();
});

// Start rest timer
function startRestTimer() {
    currentReminderIndex = 0;
    timeRemaining = currentWorkout.restTime * 60; // Convert to seconds

    showScreen('restScreen');
    updateTimerDisplay();
    updateReminder();

    // Start carousel rotation
    carouselInterval = setInterval(() => {
        currentReminderIndex = (currentReminderIndex + 1) % reminders.length;
        updateReminder();
    }, 5000); // Change reminder every 5 seconds

    // Start countdown
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            enableNextButton();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update next button text
    const btnMinutes = Math.floor(timeRemaining / 60);
    const btnSeconds = timeRemaining % 60;
    nextBtn.textContent = `Next (${String(btnMinutes).padStart(2, '0')}:${String(btnSeconds).padStart(2, '0')})`;
}

// Update reminder carousel
function updateReminder() {
    reminderText.textContent = reminders[currentReminderIndex];
    
    // Update indicators
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentReminderIndex);
    });
}

// Enable next button when timer reaches 0
function enableNextButton() {
    nextBtn.disabled = false;
    nextBtn.textContent = 'Next';
}

// Skip rest timer
skipRestBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    clearInterval(carouselInterval);
    timeRemaining = 0;
    updateTimerDisplay();
    enableNextButton();
});

// Proceed to next set/exercise
nextBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    clearInterval(carouselInterval);

    const exercise = currentWorkout.exercises[currentExerciseIndex];
    const set = exercise.sets[currentSetIndex];
    const completedReps = set.completedReps || 0;
    const targetReps = exercise.targetReps;

    // Check if weight recommendation is needed
    if (completedReps >= targetReps) {
        showWeightRecommendation(set, targetReps);
    } else {
        moveToNextSet();
    }
});

// Show weight recommendation screen
function showWeightRecommendation(set, targetReps) {
    const suggestedIncrease = 5;
    document.getElementById('suggestedWeight').textContent = `+${suggestedIncrease} lbs`;
    document.getElementById('recommendationText').textContent = 
        `Excellent! You hit your target of ${targetReps} reps. Consider increasing the weight!`;

    document.getElementById('acceptWeightBtn').onclick = () => {
        const customIncrease = parseInt(document.getElementById('customWeightIncrease').value) || suggestedIncrease;
        set.weight += customIncrease;
        moveToNextSet();
    };

    document.getElementById('skipWeightBtn').onclick = () => {
        moveToNextSet();
    };

    showScreen('weightScreen');
}

// Move to next set or exercise
function moveToNextSet() {
    const exercise = currentWorkout.exercises[currentExerciseIndex];
    
    if (currentSetIndex < exercise.sets.length - 1) {
        // Next set in same exercise
        currentSetIndex++;
        displayExercise();
    } else if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
        // Next exercise
        currentExerciseIndex++;
        currentSetIndex = 0;
        displayExercise();
    } else {
        // Workout complete
        completeWorkout();
    }
}

// Complete workout
async function completeWorkout() {
    showScreen('completeScreen');

    try {
        const response = await fetch('/myWorkouts/saveProgress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                workoutId: currentWorkout.id,
                exercises: currentWorkout.exercises
            })
        });

        const data = await response.json();
        if (!data.success) {
            console.error('Failed to save progress:', data.message);
        }
    } catch (err) {
        console.error('Error saving progress:', err);
    }
}

// End workout early
endWorkoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to end this workout?')) {
        window.location.href = '/myWorkouts';
    }
});

// Home button
document.getElementById('homeBtn').addEventListener('click', () => {
    window.location.href = '/dashboard';
});

// Utility function to show screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Handle keyboard input for reps
actualRepsInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        completeSetBtn.click();
    }
});
