// ===== WORKOUT FORM FUNCTIONALITY =====

// Store exercises data
let workoutExercises = [];
let activeExerciseId = null; // Track which exercise tab is currently active

// Mapping of sub-muscle regions for certain primary groups
const muscleSubOptions = {
    Chest: ["Upper Chest", "Mid Chest", "Lower Chest", "Inner Chest", "Outer Chest", "Sternocostal", "Clavicular", "Pectoralis Major", "Pectoralis Minor"],
    Back: ["Upper Back", "Mid Back", "Lower Back", "Lats", "Traps", "Rhomboids", "Erector Spinae", "Teres Major", "Teres Minor"],
    Shoulders: ["Front Delts", "Side Delts", "Rear Delts", "Rotator Cuff"],
    Legs: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Adductors", "Abductors"],
    Biceps: ["Short Head", "Long Head", "Brachialis", "Brachioradialis"],
    Triceps: ["Long Head", "Lateral Head", "Medial Head"],
    Abs: ["Upper Abs", "Lower Abs", "Obliques", "Transverse Abdominis"]
};

// Initialize form when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const addExerciseBtn = document.getElementById('addExerciseBtn');
    const exerciseInput = document.getElementById('exerciseInput');
    const workoutForm = document.getElementById('workoutForm');
    const wizardNext = document.getElementById('wizardNext');
    const wizardBack = document.getElementById('wizardBack');

    // ===== Exercise Browser =====
    const browseExercisesBtn = document.getElementById('browseExercisesBtn');
    const exerciseBrowserModal = document.getElementById('exerciseBrowserModal');
    const closeExerciseBrowserBtn = document.getElementById('closeExerciseBrowserBtn');
    const cancelBrowserBtn = document.getElementById('cancelBrowserBtn');
    const exerciseBrowserSearch = document.getElementById('exerciseBrowserSearch');
    const exerciseBrowserFilter = document.getElementById('exerciseBrowserFilter');
    let allAvailableExercises = [];

    browseExercisesBtn.addEventListener('click', openExerciseBrowser);
    closeExerciseBrowserBtn.addEventListener('click', closeExerciseBrowser);
    cancelBrowserBtn.addEventListener('click', closeExerciseBrowser);

    exerciseBrowserSearch.addEventListener('input', filterExercises);
    exerciseBrowserFilter.addEventListener('change', filterExercises);

    function openExerciseBrowser() {
        exerciseBrowserModal.classList.add('active');
        exerciseBrowserSearch.value = '';
        exerciseBrowserFilter.value = '';
        fetchAvailableExercises();
    }

    function closeExerciseBrowser() {
        exerciseBrowserModal.classList.remove('active');
    }

    async function fetchAvailableExercises() {
        try {
            const response = await fetch('/createWorkout/getExercises');
            const data = await response.json();
            
            if (data.success) {
                allAvailableExercises = data.exercises || [];
                renderAvailableExercises(allAvailableExercises);
            } else {
                alert('Failed to fetch exercises');
            }
        } catch (err) {
            console.error('Error fetching exercises:', err);
            alert('Unable to fetch exercises');
        }
    }

    function renderAvailableExercises(exercises) {
        const exerciseBrowserList = document.getElementById('exerciseBrowserList');
        exerciseBrowserList.innerHTML = '';

        if (!exercises || exercises.length === 0) {
            exerciseBrowserList.innerHTML = '<li class="no-exercises-found">No exercises found</li>';
            return;
        }

        exercises.forEach(exercise => {
            const li = document.createElement('li');
            li.className = 'exercise-browser-item';
            li.innerHTML = `
                <div class="exercise-browser-info">
                    <div class="exercise-browser-name">${exercise.exercise_name}</div>
                    <div class="exercise-browser-muscle">
                        <span class="exercise-browser-muscle-tag">${exercise.target_muscle}</span>
                        ${exercise.specific_muscle ? `<span class="exercise-browser-muscle-tag">${exercise.specific_muscle}</span>` : ''}
                    </div>
                </div>
                <button type="button" class="exercise-browser-select-btn" data-exercise-id="${exercise.id}" data-exercise-name="${exercise.exercise_name}" data-target-muscle="${exercise.target_muscle}" data-specific-muscle="${exercise.specific_muscle || ''}">Select</button>
            `;
            exerciseBrowserList.appendChild(li);

            // Add click handler to select button
            const selectBtn = li.querySelector('.exercise-browser-select-btn');
            selectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                addExerciseFromBrowser(
                    exercise.id,
                    exercise.exercise_name,
                    exercise.target_muscle,
                    exercise.specific_muscle
                );
                closeExerciseBrowser();
            });
        });
    }

    function filterExercises() {
        const searchQuery = exerciseBrowserSearch.value.toLowerCase();
        const selectedMuscle = exerciseBrowserFilter.value;

        const filtered = allAvailableExercises.filter(exercise => {
            const nameMatch = exercise.exercise_name.toLowerCase().includes(searchQuery);
            const muscleMatch = !selectedMuscle || exercise.target_muscle === selectedMuscle;
            return nameMatch && muscleMatch;
        });

        renderAvailableExercises(filtered);
    }

    function addExerciseFromBrowser(templateId, exerciseName, targetMuscle, specificMuscle) {
        // Check if exercise already added
        if (workoutExercises.find(ex => ex.name.toLowerCase() === exerciseName.toLowerCase())) {
            alert('This exercise is already in your plan. Add multiple sets to the existing exercise instead.');
            return;
        }

        const exercise = {
            id: Date.now(),
            name: exerciseName,
            templateId: templateId,
            authenticated: true, // Exercises from library are already authenticated
            exerciseType: targetMuscle,
            subType: specificMuscle || '',
            targetReps: 12,
            collapsed: true,
            sets: [
                {
                    id: 1,
                    setNumber: 1,
                    reps: '',
                    weight: ''
                }
            ]
        };

        workoutExercises.push(exercise);
        renderExercise(exercise);
        switchToExercise(exercise.id);
    }

    // Add exercise button click handler
    addExerciseBtn.addEventListener('click', addExercise);

    // Allow pressing Enter in the input to add exercise
    exerciseInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addExercise();
        }
    });

    // Form submission
    workoutForm.addEventListener('submit', submitWorkoutForm);

    // Wizard navigation (mobile)
    let currentStep = 1;
    const totalSteps = 2;
    const mq = window.matchMedia('(max-width: 768px)');

    function isMobileWizard() {
        return mq.matches;
    }

    function setDotActive(step) {
        document.querySelectorAll('.wizard-progress .dot').forEach(dot => {
            dot.classList.toggle('active', Number(dot.getAttribute('data-step')) === step);
        });
    }

    function showStep(step) {
        currentStep = Math.min(Math.max(step, 1), totalSteps);
        document.querySelectorAll('.step-section').forEach(sec => {
            const s = Number(sec.getAttribute('data-step'));
            if (isMobileWizard()) {
                sec.classList.toggle('active', s === currentStep);
            } else {
                sec.classList.add('active');
            }
        });
        updateWizardButtons();
        setDotActive(currentStep);
    }

    function updateWizardButtons() {
        if (!wizardNext || !wizardBack) return;
        wizardBack.disabled = currentStep === 1;
        wizardNext.textContent = currentStep === totalSteps ? 'Submit' : 'Next';
    }

    function validateStep(step) {
        if (step === 1) {
            const workoutName = document.getElementById('workoutName').value.trim();
            const restTime = document.getElementById('restTime').value;
            if (!workoutName) {
                alert('Please enter a workout plan name');
                return false;
            }
            if (!restTime) {
                alert('Please select a rest time');
                return false;
            }
        }
        return true;
    }

    function handleNext() {
        if (currentStep < totalSteps) {
            if (!validateStep(currentStep)) return;
            showStep(currentStep + 1);
        } else {
            // Last step -> submit form
            workoutForm.requestSubmit();
        }
    }

    function handleBack() {
        if (currentStep > 1) showStep(currentStep - 1);
    }

    if (wizardNext && wizardBack) {
        wizardNext.addEventListener('click', handleNext);
        wizardBack.addEventListener('click', handleBack);
        mq.addEventListener('change', () => showStep(currentStep));
        showStep(currentStep);
    }
});

// Add a new exercise to the form
function addExercise() {
    const exerciseInput = document.getElementById('exerciseInput');
    const exerciseName = exerciseInput.value.trim();

    if (!exerciseName) {
        alert('Please enter an exercise name');
        return;
    }

    // Check if exercise already added (case-insensitive)
    if (workoutExercises.find(ex => ex.name.toLowerCase() === exerciseName.toLowerCase())) {
        alert('This exercise is already in your plan. Add multiple sets to the existing exercise instead.');
        return;
    }

    // Create exercise object with pending authentication status
    const exercise = {
        id: Date.now(),
        name: exerciseName,
        authenticated: false,
        exerciseType: '',
        subType: '',
        targetReps: 12,
        collapsed: true, // Start collapsed for mobile-friendly UX
        sets: [
            {
                id: 1,
                setNumber: 1,
                reps: '',
                weight: ''
            }
        ]
    };

    workoutExercises.push(exercise);
    renderExercise(exercise); // Render the card first
    switchToExercise(exercise.id); // Then switch to it (hides others, shows this one)
    exerciseInput.value = '';
    exerciseInput.focus();
}

// Render the tab navigation for exercises
function renderExerciseTabs() {
    let tabContainer = document.getElementById('exerciseTabsContainer');
    
    // Create tab container if it doesn't exist
    if (!tabContainer) {
        tabContainer = document.createElement('div');
        tabContainer.id = 'exerciseTabsContainer';
        tabContainer.className = 'exercise-tabs-container';
        
        // Add inline styles for scrollability and base styling
        tabContainer.style.display = 'flex';
        tabContainer.style.overflowX = 'auto';
        tabContainer.style.gap = '8px';
        tabContainer.style.padding = '10px';
        tabContainer.style.marginBottom = '15px';
        tabContainer.style.backgroundColor = 'transparent';
        tabContainer.style.borderRadius = '8px';
        tabContainer.style.whiteSpace = 'nowrap';
        tabContainer.style.WebkitOverflowScrolling = 'touch'; // Smooth scrolling on iOS
        
        const exercisesContainer = document.getElementById('exercisesContainer');
        exercisesContainer.parentNode.insertBefore(tabContainer, exercisesContainer);
    }
    
    // Clear and rebuild tabs
    tabContainer.innerHTML = '';
    
    if (workoutExercises.length === 0) {
        tabContainer.style.display = 'none';
        return;
    }
    
    tabContainer.style.display = 'flex';
    
    workoutExercises.forEach((exercise, index) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.className = `exercise-tab ${exercise.id === activeExerciseId ? 'active' : ''}`;
        tab.onclick = () => switchToExercise(exercise.id);
        
        // Add inline styling that matches the form theme
        tab.style.flex = '0 0 auto'; // Don't shrink
        tab.style.minWidth = '140px';
        tab.style.padding = '10px 12px';
        tab.style.border = '2px solid #ddd';
        tab.style.borderRadius = '8px';
        tab.style.cursor = 'pointer';
        tab.style.transition = 'all 0.2s';
        tab.style.textAlign = 'left';
        
        if (exercise.id === activeExerciseId) {
            tab.style.backgroundColor = '#4a90e2';
            tab.style.borderColor = '#4a90e2';
            tab.style.color = 'white';
            tab.style.fontWeight = '600';
        } else {
            tab.style.backgroundColor = 'white';
            tab.style.borderColor = '#ddd';
            tab.style.color = '#333';
        }
        
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.style.display = 'flex';
        tabContent.style.flexDirection = 'column';
        tabContent.style.gap = '4px';
        
        const tabName = document.createElement('span');
        tabName.className = 'tab-name';
        tabName.textContent = exercise.name;
        tabName.style.fontSize = '14px';
        tabName.style.fontWeight = '600';
        tabName.style.whiteSpace = 'nowrap';
        tabName.style.overflow = 'hidden';
        tabName.style.textOverflow = 'ellipsis';
        
        const tabInfo = document.createElement('span');
        tabInfo.className = 'tab-info';
        const typeText = exercise.exerciseType || '?';
        tabInfo.textContent = `${typeText} • ${exercise.sets.length}`;
        tabInfo.style.fontSize = '12px';
        tabInfo.style.opacity = '0.8';
        
        tabContent.appendChild(tabName);
        tabContent.appendChild(tabInfo);
        tab.appendChild(tabContent);
        
        // Add hover effect
        tab.addEventListener('mouseenter', function() {
            if (exercise.id !== activeExerciseId) {
                this.style.backgroundColor = '#f0f0f0';
                this.style.borderColor = '#999';
            }
        });
        tab.addEventListener('mouseleave', function() {
            if (exercise.id !== activeExerciseId) {
                this.style.backgroundColor = 'white';
                this.style.borderColor = '#ddd';
            }
        });
        
        tabContainer.appendChild(tab);
    });
    
    // Add "New Exercise" button to tabs
    const newTab = document.createElement('button');
    newTab.type = 'button';
    newTab.className = 'exercise-tab new-exercise-tab';
    newTab.style.flex = '0 0 auto';
    newTab.style.minWidth = '80px';
    newTab.style.padding = '10px 12px';
    newTab.style.border = '2px dashed #4a90e2';
    newTab.style.borderRadius = '8px';
    newTab.style.backgroundColor = 'transparent';
    newTab.style.color = '#4a90e2';
    newTab.style.cursor = 'pointer';
    newTab.style.fontWeight = '600';
    newTab.style.transition = 'all 0.2s';
    newTab.innerHTML = '<span class="tab-content"><span class="tab-name">+ New</span></span>';
    newTab.onclick = () => {
        document.getElementById('exerciseInput').focus();
        document.getElementById('exerciseInput').scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    
    // Add hover effect
    newTab.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#e8f4ff';
    });
    newTab.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });
    
    tabContainer.appendChild(newTab);
}

// Switch to a specific exercise tab
function switchToExercise(exerciseId) {
    activeExerciseId = exerciseId;
    
    // Update tab active states
    document.querySelectorAll('.exercise-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show only the active exercise card
    workoutExercises.forEach(ex => {
        const card = document.getElementById(`exercise-${ex.id}`);
        if (card) {
            if (ex.id === exerciseId) {
                card.style.display = 'block';
                card.classList.remove('collapsed');
                ex.collapsed = false;
                
                // Update button text
                const btn = document.getElementById(`collapse-btn-${ex.id}`);
                if (btn) btn.textContent = 'Collapse';
            } else {
                card.style.display = 'none';
            }
        }
    });
    
    // Re-render tabs to update active state
    renderExerciseTabs();
}

// Render a single exercise card
function renderExercise(exercise) {
    const container = document.getElementById('exercisesContainer');

    const exerciseCard = document.createElement('div');
    exerciseCard.className = 'exercise-card';
    exerciseCard.id = `exercise-${exercise.id}`;
    // Hide by default, shown only when active tab
    if (exercise.id !== activeExerciseId) {
        exerciseCard.style.display = 'none';
    }

    // Exercise header
    const header = document.createElement('div');
    header.className = 'exercise-header';
    
    const headerInfo = document.createElement('div');
    headerInfo.className = 'exercise-header-info';
    
    const nameSpan = document.createElement('div');
    nameSpan.className = 'exercise-name';
    nameSpan.textContent = exercise.name;
    
    const badge = document.createElement('span');
    badge.className = `auth-badge ${exercise.authenticated ? 'approved' : 'pending'}`;
    badge.textContent = exercise.authenticated ? '✓ Approved' : '⏳ Pending Auth';
    
    // Summary info (visible when collapsed)
    const summaryInfo = document.createElement('div');
    summaryInfo.className = 'exercise-summary';
    summaryInfo.id = `summary-${exercise.id}`;
    const typeText = exercise.exerciseType || 'Not set';
    const setCount = exercise.sets.length;
    summaryInfo.textContent = `${typeText} • ${setCount} set${setCount !== 1 ? 's' : ''}`;
    
    headerInfo.appendChild(nameSpan);
    headerInfo.appendChild(summaryInfo);
    headerInfo.appendChild(badge);
    
    const collapseBtn = document.createElement('button');
    collapseBtn.type = 'button';
    collapseBtn.className = 'btn-toggle-collapse';
    collapseBtn.id = `collapse-btn-${exercise.id}`;
    collapseBtn.textContent = 'Collapse';
    collapseBtn.onclick = () => toggleExerciseCollapse(exercise.id);
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove';
    removeBtn.textContent = 'Remove Exercise';
    removeBtn.onclick = () => removeExercise(exercise.id);
    
    header.appendChild(headerInfo);
    header.appendChild(collapseBtn);
    header.appendChild(removeBtn);

    // Toggle collapse on mobile by tapping header (except buttons)
    header.addEventListener('click', (e) => {
        if (e.target === header || e.target === headerInfo || e.target.closest('.exercise-header-info')) {
            exerciseCard.classList.toggle('collapsed');
        }
    });

    // Exercise metadata (horizontal row below header)
    const meta = document.createElement('div');
    meta.className = 'exercise-meta';
    meta.innerHTML = `
        <div class="meta-field">
            <label for="ExerciseType-${exercise.id}">Type of Exercise:</label>
            <select 
                id="ExerciseType-${exercise.id}"
                class="exercise-type-select"
                onchange="handleExerciseTypeChangeExercise(${exercise.id}, this.value)"
            >
                <option value="">-- Select --</option>
                <option value="Chest">Chest</option>
                <option value="Biceps">Biceps</option>
                <option value="Triceps">Triceps</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Back">Back</option>
                <option value="Legs">Legs</option>
                <option value="Abs">Abs</option>
                <option value="Cardio">Cardio</option>
                <option value="Other">Other</option>
            </select>
        </div>
        
        <div class="meta-field">
            <label for="ExerciseSubType-${exercise.id}">Muscle Region (optional):</label>
            <select 
                id="ExerciseSubType-${exercise.id}"
                class="exercise-subtype-select"
                style="display:none;"
                onchange="updateExercise(${exercise.id}, 'subType', this.value)"
            >
                <option value="">-- optional --</option>
            </select>
        </div>
        
        <div class="meta-field">
            <label for="TargetReps-${exercise.id}">Target Reps:</label>
            <input 
                type="number" 
                id="TargetReps-${exercise.id}"
                class="target-reps-input"
                min="1"
                max="20"
                value="${exercise.targetReps}"
                onchange="updateExercise(${exercise.id}, 'targetReps', parseInt(this.value))"
            >
        </div>
    `;

    // Sets container
    const setsContainer = document.createElement('div');
    setsContainer.className = 'sets-container';
    setsContainer.id = `sets-${exercise.id}`;

    // Render each set
    exercise.sets.forEach((set, index) => {
        const setGroup = createSetInputGroup(exercise.id, set, index + 1);
        setsContainer.appendChild(setGroup);
    });

    // Add Set button
    const addSetBtn = document.createElement('button');
    addSetBtn.type = 'button';
    addSetBtn.className = 'btn-add-set';
    addSetBtn.textContent = '+ Add Another Set';
    addSetBtn.onclick = () => addSet(exercise.id);

    setsContainer.appendChild(addSetBtn);

    // Append in order: header -> meta (horizontal row) -> sets (weight/reps)
    exerciseCard.appendChild(header);
    exerciseCard.appendChild(meta);
    exerciseCard.appendChild(setsContainer);
    container.appendChild(exerciseCard);

    // Initialize meta selects with persisted values
    const typeSelect = meta.querySelector(`#ExerciseType-${exercise.id}`);
    if (exercise.exerciseType) typeSelect.value = exercise.exerciseType;
    handleExerciseTypeChangeExercise(exercise.id, typeSelect.value);
    const subSelect = meta.querySelector(`#ExerciseSubType-${exercise.id}`);
    if (exercise.subType && subSelect) subSelect.value = exercise.subType;
}

// Create a set input group
function createSetInputGroup(exerciseId, set, setNumber) {
    const group = document.createElement('div');
    group.className = 'set-input-group';
    group.id = `set-${exerciseId}-${set.id}`;

    group.innerHTML = `
        <div>
            <label for="reps-${exerciseId}-${set.id}">Set ${setNumber} Reps:</label>
            <input 
                type="number" 
                id="reps-${exerciseId}-${set.id}" 
                class="set-reps"
                placeholder="e.g., 10"
                min="1"
                value="${set.reps}"
                onchange="updateSet(${exerciseId}, ${set.id}, 'reps', this.value)"
            >
        </div>
        <div>
            <label for="weight-${exerciseId}-${set.id}">Weight (lbs):</label>
            <input 
                type="number" 
                id="weight-${exerciseId}-${set.id}" 
                class="set-weight"
                placeholder="e.g., 185"
                min="0"
                step="0.5"
                value="${set.weight}"
                onchange="updateSet(${exerciseId}, ${set.id}, 'weight', this.value)"
            >
        </div>
        <button 
            type="button" 
            class="btn-remove-set"
            onclick="removeSet(${exerciseId}, ${set.id})"
            ${set.id === 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
        >
            Remove Set
        </button>
    `;

    return group;
}

// Update exercise-level fields
function updateExercise(exerciseId, field, value) {
    const exercise = workoutExercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    exercise[field] = value;
}

// Handle exercise-level type change and suboptions
function handleExerciseTypeChangeExercise(exerciseId, typeValue) {
    updateExercise(exerciseId, 'exerciseType', typeValue);

    const subSelect = document.getElementById(`ExerciseSubType-${exerciseId}`);
    if (!subSelect) return;

    subSelect.innerHTML = '<option value="">-- optional --</option>';
    const subOptions = muscleSubOptions[typeValue];
    if (Array.isArray(subOptions) && subOptions.length) {
        subOptions.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = opt;
            subSelect.appendChild(o);
        });
        subSelect.style.display = '';
    } else {
        subSelect.style.display = 'none';
        updateExercise(exerciseId, 'subType', '');
    }
    
    // Update summary with new exercise type
    updateExerciseSummary(exerciseId);
}

function toggleExerciseCollapse(exerciseId) {
    const card = document.getElementById(`exercise-${exerciseId}`);
    const exercise = workoutExercises.find(ex => ex.id === exerciseId);
    if (!card || !exercise) return;
    
    // Simple toggle - no auto-collapse needed with tabs
    card.classList.toggle('collapsed');
    exercise.collapsed = !exercise.collapsed;
    
    // Update button text
    const btn = document.getElementById(`collapse-btn-${exerciseId}`);
    if (btn) {
        btn.textContent = exercise.collapsed ? 'Expand' : 'Collapse';
    }
    
    // Update summary when collapsing
    if (exercise.collapsed) {
        updateExerciseSummary(exerciseId);
    }
}

// Update the summary info shown when collapsed
function updateExerciseSummary(exerciseId) {
    const exercise = workoutExercises.find(ex => ex.id === exerciseId);
    const summaryEl = document.getElementById(`summary-${exerciseId}`);
    if (!exercise || !summaryEl) return;
    
    const typeText = exercise.exerciseType || 'Not set';
    const setCount = exercise.sets.length;
    summaryEl.textContent = `${typeText} • ${setCount} set${setCount !== 1 ? 's' : ''}`;
    
    // Also update the tab info
    renderExerciseTabs();
}

// Add a new set to an exercise
function addSet(exerciseId) {
    const exercise = workoutExercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const newSetId = Math.max(...exercise.sets.map(s => s.id)) + 1;
    const newSet = {
        id: newSetId,
        setNumber: exercise.sets.length + 1,
        reps: '',
        weight: ''
    };

    exercise.sets.push(newSet);

    // Re-render the exercise to update set numbers
    const container = document.getElementById('exercisesContainer');
    const oldCard = document.getElementById(`exercise-${exerciseId}`);
    oldCard.remove();
    renderExercise(exercise);
    
    // Update summary with new set count
    updateExerciseSummary(exerciseId);
}

// Remove a set from an exercise
function removeSet(exerciseId, setId) {
    const exercise = workoutExercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    if (exercise.sets.length === 1) {
        alert('You must have at least one set per exercise');
        return;
    }

    exercise.sets = exercise.sets.filter(s => s.id !== setId);

    // Re-render the exercise
    const container = document.getElementById('exercisesContainer');
    const oldCard = document.getElementById(`exercise-${exerciseId}`);
    oldCard.remove();
    renderExercise(exercise);
    
    // Update summary with new set count
    updateExerciseSummary(exerciseId);
}

// Update set data
function updateSet(exerciseId, setId, field, value) {
    const exercise = workoutExercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const set = exercise.sets.find(s => s.id === setId);
    if (!set) return;

    set[field] = value;
}

// Remove an exercise
function removeExercise(exerciseId) {
    const exercise = workoutExercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    if (confirm(`Remove ${exercise.name} from your workout?`)) {
        workoutExercises = workoutExercises.filter(ex => ex.id !== exerciseId);
        const card = document.getElementById(`exercise-${exerciseId}`);
        card.remove();
        
        // Switch to another exercise if available
        if (workoutExercises.length > 0) {
            if (activeExerciseId === exerciseId) {
                // Switch to first available exercise
                switchToExercise(workoutExercises[0].id);
            } else {
                renderExerciseTabs();
            }
        } else {
            // No exercises left
            activeExerciseId = null;
            renderExerciseTabs();
        }
    }
}

// Submit the workout form
function submitWorkoutForm(e) {
    e.preventDefault();

    const workoutName = document.getElementById('workoutName').value;
    const restTime = document.getElementById('restTime').value;

    if (!workoutName) {
        alert('Please enter a workout plan name');
        return;
    }

    if (!restTime) {
        alert('Please select a rest time');
        return;
    }

    if (workoutExercises.length === 0) {
        alert('Please add at least one exercise');
        return;
    }

    // Validate that all sets have reps and weight
    for (const exercise of workoutExercises) {
        for (const set of exercise.sets) {
            if (!set.reps || !set.weight) {
                alert(`${exercise.name}: Set ${exercise.sets.indexOf(set) + 1} is missing reps or weight`);
                return;
            }
        }
    }

    if (workoutExercises.subType === '') 
    {
        workoutExercises.subType = 'N/A';
    }

    // Prepare data for submission
    const workoutData = {
        workoutName: workoutName,
        restTime: restTime,
        exercises: workoutExercises
    };

    console.log('Workout Data:', workoutData);

    // Send to backend
    fetch('/createWorkouts/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(workoutData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Workout plan created successfully! Your exercises are pending admin authentication.');
            location.reload();
        } else {
            alert('Error creating workout: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting form: ' + error.message);
    });
}