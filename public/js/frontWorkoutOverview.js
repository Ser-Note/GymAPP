// ===== Workout Overview Logic =====

let currentWorkout = null;
let selectedExerciseIndex = null;
let timerInterval = null;
let timeRemaining = 0;
let carouselInterval = null;
const reminders = [
  "Drink water to stay hydrated!",
  "Take a deep breath and relax",
  "Great work! You're crushing it!",
  "Stretch while you rest"
];
let currentReminderIndex = 0;

// Screens
const overviewScreen = document.getElementById('overviewScreen');
const exerciseDetail = document.getElementById('exerciseDetail');
const restScreen = document.getElementById('restScreen');
const completeScreen = document.getElementById('completeScreen');

// Overview
const exerciseList = document.getElementById('exerciseList');
const completeWorkoutBtn = document.getElementById('completeWorkoutBtn');
const resetWorkoutBtn = document.getElementById('resetWorkoutBtn');

// Detail
const detailExerciseName = document.getElementById('detailExerciseName');
const setList = document.getElementById('setList');
const backToOverviewBtn = document.getElementById('backToOverviewBtn');

// Rest
const timerDisplay = document.getElementById('timerDisplay');
const reminderText = document.getElementById('reminderText');
const nextBtn = document.getElementById('nextBtn');
const skipRestBtn = document.getElementById('skipRestBtn');

// Complete
const homeBtn = document.getElementById('homeBtn');

// Init
document.addEventListener('DOMContentLoaded', () => {
  initializeWorkout();
});

async function initializeWorkout() {
  try {
    const params = new URLSearchParams(window.location.search);
    const workoutId = params.get('id');
    if (!workoutId) {
      alert('Workout ID not found');
      window.location.href = '/myWorkouts';
      return;
    }
    const response = await fetch(`/myWorkouts/current?id=${workoutId}`);
    const data = await response.json();
    if (!data.success || !data.workout) {
      alert('Failed to load workout');
      window.location.href = '/myWorkouts';
      return;
    }
    currentWorkout = data.workout;
    renderOverview();
    showScreen('overviewScreen');
  } catch (err) {
    console.error('Error loading workout:', err);
    alert('Unable to load workout');
    window.location.href = '/myWorkouts';
  }
}

function renderOverview() {
  exerciseList.innerHTML = '';
  currentWorkout.exercises.forEach((ex, idx) => {
    const completed = ex.sets.filter(s => (typeof s.completedReps === 'number') && s.completedReps >= 0).length;
    const total = ex.sets.length;
    const li = document.createElement('li');
    li.className = 'exercise-overview-item';
    li.innerHTML = `
      <div class="detail-box" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:700; color:#2563eb;">${ex.name}</div>
          <div style="font-size:0.9rem; color:#6b7280;">${completed}/${total} sets completed • Target ${ex.targetReps} reps</div>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-primary" data-action="open" data-idx="${idx}">Open</button>
        </div>
      </div>
    `;
    exerciseList.appendChild(li);
  });

  // Attach handlers
  exerciseList.querySelectorAll('button[data-action="open"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      openExerciseDetail(idx);
    });
  });
}

function openExerciseDetail(idx) {
  selectedExerciseIndex = idx;
  const ex = currentWorkout.exercises[idx];
  detailExerciseName.textContent = ex.name;
  setList.innerHTML = '';
  ex.sets.forEach((set, sIdx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'detail-box';
    const existing = (typeof set.completedReps === 'number');
    wrapper.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem;">
        <div>
          <div style="font-size:1rem; color:#6b7280;">Set ${sIdx + 1} of ${ex.sets.length}</div>
          <div style="font-size:1.2rem; font-weight:700; color:#2563eb;">${set.weight} lbs • Target ${ex.targetReps} reps</div>
          <div style="font-size:0.9rem; color:#6b7280;">${existing ? `Completed: ${set.completedReps} reps` : 'Not completed'}</div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <input type="number" min="0" placeholder="Actual reps" class="reps-input" id="reps-${idx}-${sIdx}" value="${existing ? set.completedReps : ''}">
          <button class="btn btn-primary" data-action="complete-set" data-ex="${idx}" data-set="${sIdx}">Complete Set</button>
        </div>
      </div>
    `;
    setList.appendChild(wrapper);
  });

  // Attach complete handlers
  setList.querySelectorAll('button[data-action="complete-set"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const exIdx = parseInt(btn.getAttribute('data-ex'));
      const setIdx = parseInt(btn.getAttribute('data-set'));
      completeSet(exIdx, setIdx);
    });
  });

  showScreen('exerciseDetail');
}

function completeSet(exIdx, setIdx) {
  const input = document.getElementById(`reps-${exIdx}-${setIdx}`);
  const reps = parseInt(input.value) || 0;
  if (reps < 0) {
    alert('Please enter a valid number of reps');
    return;
  }
  const ex = currentWorkout.exercises[exIdx];
  const set = ex.sets[setIdx];
  set.completedReps = reps;
  
  // Check if user hit target reps
  if (reps >= ex.targetReps) {
    // Show weight recommendation
    showWeightRecommendation(exIdx, setIdx, set);
  } else {
    // No weight rec; check if more sets remain
    const nextSetIdx = setIdx + 1;
    if (nextSetIdx < ex.sets.length) {
      // More sets; show rest then return to detail
      startRestTimerAndReturn(exIdx);
    } else {
      // Exercise done; refresh overview and detail
      renderOverview();
      openExerciseDetail(exIdx);
    }
  }
}

function showWeightRecommendation(exIdx, setIdx, set) {
  const ex = currentWorkout.exercises[exIdx];
  const nextSetIdx = setIdx + 1;
  const suggestedIncrease = 5;
  document.getElementById('suggestedWeight').textContent = `+${suggestedIncrease} lbs`;
  document.getElementById('recommendationText').textContent = 
    `Excellent! You hit your target of ${ex.targetReps} reps. Consider increasing the weight!`;
  document.getElementById('customWeightIncrease').value = '';

  document.getElementById('acceptWeightBtn').onclick = () => {
    const customIncrease = parseInt(document.getElementById('customWeightIncrease').value) || suggestedIncrease;
    // Update the NEXT set's weight, not the current one
    if (nextSetIdx < ex.sets.length) {
      ex.sets[nextSetIdx].weight += customIncrease;
    }
    proceedAfterWeightRec(exIdx, setIdx);
  };

  document.getElementById('skipWeightBtn').onclick = () => {
    proceedAfterWeightRec(exIdx, setIdx);
  };

  showScreen('weightScreen');
}

function proceedAfterWeightRec(exIdx, setIdx) {
  const ex = currentWorkout.exercises[exIdx];
  const nextSetIdx = setIdx + 1;
  if (nextSetIdx < ex.sets.length) {
    // More sets remain; show rest then return to exercise detail
    startRestTimerAndReturn(exIdx);
  } else {
    // Exercise done; refresh overview and return to exercise detail
    renderOverview();
    openExerciseDetail(exIdx);
  }
}

backToOverviewBtn.addEventListener('click', () => {
  showScreen('overviewScreen');
});

completeWorkoutBtn.addEventListener('click', async () => {
  try {
    const response = await fetch('/myWorkouts/saveProgress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workoutId: currentWorkout.id,
        exercises: currentWorkout.exercises
      })
    });
    const data = await response.json();
    if (!data.success) {
      console.error('Failed to save progress:', data.message);
    }
    showScreen('completeScreen');
  } catch (err) {
    console.error('Error saving progress:', err);
  }
});

// Rest timer (optional)
function startRestTimer() {
  currentReminderIndex = 0;
  timeRemaining = (currentWorkout.restTime || 0) * 60; // seconds
  if (!timeRemaining || timeRemaining <= 0) {
    // No rest configured; skip
    return;
  }
  showScreen('restScreen');
  updateTimerDisplay();
  updateReminder();

  carouselInterval = setInterval(() => {
    currentReminderIndex = (currentReminderIndex + 1) % reminders.length;
    updateReminder();
  }, 5000);

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      enableNextButton();
    }
  }, 1000);
}

function startRestTimerAndReturn(exIdx) {
  currentReminderIndex = 0;
  timeRemaining = (currentWorkout.restTime || 0) * 60; // seconds
  if (!timeRemaining || timeRemaining <= 0) {
    // No rest configured; go straight back to detail
    renderOverview();
    openExerciseDetail(exIdx);
    return;
  }
  showScreen('restScreen');
  updateTimerDisplay();
  updateReminder();

  carouselInterval = setInterval(() => {
    currentReminderIndex = (currentReminderIndex + 1) % reminders.length;
    updateReminder();
  }, 5000);

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      enableNextButton();
    }
  }, 1000);

  // Store the exercise index so we can return to it
  nextBtn.onclick = () => {
    clearInterval(timerInterval);
    clearInterval(carouselInterval);
    renderOverview();
    openExerciseDetail(exIdx);
  };
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const btnMinutes = Math.floor(timeRemaining / 60);
  const btnSeconds = timeRemaining % 60;
  nextBtn.textContent = `Next (${String(btnMinutes).padStart(2, '0')}:${String(btnSeconds).padStart(2, '0')})`;
}

function updateReminder() {
  reminderText.textContent = reminders[currentReminderIndex];
  document.querySelectorAll('.indicator').forEach((indicator, index) => {
    indicator.classList.toggle('active', index === currentReminderIndex);
  });
}

function enableNextButton() {
  nextBtn.disabled = false;
  nextBtn.textContent = 'Next';
}

skipRestBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  clearInterval(carouselInterval);
  timeRemaining = 0;
  updateTimerDisplay();
  enableNextButton();
});

nextBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  clearInterval(carouselInterval);
  showScreen('overviewScreen');
});

homeBtn.addEventListener('click', () => {
  window.location.href = '/dashboard';
});

resetWorkoutBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset this workout? All progress will be lost.')) {
    window.location.href = '/myWorkouts';
  }
});

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}
