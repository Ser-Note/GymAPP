// Tab-based exercise view with sets management
document.addEventListener('DOMContentLoaded', () => {
    // Tab click handler - switch between exercises
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('exercise-tab') && !e.target.classList.contains('tab-delete')) {
            e.preventDefault();
            const index = e.target.getAttribute('data-exercise-index');
            
            // Remove active class from all tabs and contents
            document.querySelectorAll('.exercise-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.exercise-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            e.target.classList.add('active');
            document.querySelector(`.exercise-content[data-exercise-index="${index}"]`).classList.add('active');
        }
    });

    // Delete exercise from tab
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-delete')) {
            e.preventDefault();
            e.stopPropagation();
            const exerciseIndex = e.target.getAttribute('data-exercise-index');
            const tab = document.querySelector(`.exercise-tab[data-exercise-index="${exerciseIndex}"]`);
            const content = document.querySelector(`.exercise-content[data-exercise-index="${exerciseIndex}"]`);
            
            tab.remove();
            content.remove();
            
            // Activate the first remaining tab
            const firstTab = document.querySelector('.exercise-tab');
            if (firstTab) {
                firstTab.click();
            }
        }
    });

    // Toggle sets functionality
    document.addEventListener('click', (e) => {
        if (e.target.closest('.toggle-sets')) {
            e.preventDefault();
            const button = e.target.closest('.toggle-sets');
            const exerciseIndex = button.getAttribute('data-exercise-index');
            const setsContainer = document.querySelector(`.sets-container[data-exercise-index="${exerciseIndex}"]`);
            const toggleText = button.querySelector('.toggle-text');
            
            setsContainer.classList.toggle('collapsed');
            button.classList.toggle('expanded');
            
            if (setsContainer.classList.contains('collapsed')) {
                toggleText.textContent = 'Show Sets';
            } else {
                toggleText.textContent = 'Hide Sets';
            }
        }
    });

    // Delete set functionality
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-set')) {
            e.preventDefault();
            e.target.closest('.set-item').remove();
        }
    });

    // Add set functionality
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-set')) {
            e.preventDefault();
            const exerciseIndex = e.target.getAttribute('data-exercise-index');
            const setsContainer = document.querySelector(`.sets-container[data-exercise-index="${exerciseIndex}"]`);
            const setItems = setsContainer.querySelectorAll('.set-item');
            
            const highestSetNumber = setItems.length > 0 ? 
                Math.max(...Array.from(setItems).map(item => {
                    const match = item.querySelector('label').textContent.match(/Set (\d+)/);
                    return match ? parseInt(match[1]) : 0;
                })) : 0;
            
            const newSetNumber = highestSetNumber + 1;
            const setIndex = setItems.length;
            const newSetItem = document.createElement('div');
            newSetItem.className = 'set-item';
            newSetItem.innerHTML = `
                <div class="set-header">
                    <div class="set-fields">
                        <label>Set ${newSetNumber} - Reps:</label>
                        <input type="number" name="reps[${exerciseIndex}][${setIndex}]" value="" required>
                        <label>Set ${newSetNumber} - Weight (lbs):</label>
                        <input type="number" name="weight[${exerciseIndex}][${setIndex}]" value="" required>
                    </div>
                    <button type="button" class="btn-delete-set" title="Delete set">−</button>
                </div>
            `;
            
            setsContainer.insertBefore(newSetItem, e.target);
        }
    });

    // Add exercise functionality - find button and attach listener
    const attachAddExerciseListener = () => {
        const addExerciseBtn = document.querySelector('.btn-add-exercise-tab');
        if (!addExerciseBtn) return;

        // Remove existing listener by replacing the element
        const newBtn = addExerciseBtn.cloneNode(true);
        addExerciseBtn.parentNode.replaceChild(newBtn, addExerciseBtn);

        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const form = document.querySelector('.workoutEditForm');
            const exerciseTabs = document.querySelector('.exercise-tabs');
            const existingExercises = document.querySelectorAll('.exercise-tab');
            const exerciseIndex = existingExercises.length;
            
            // Prompt user for exercise name
            const exerciseName = prompt('Enter exercise name:');
            if (!exerciseName || exerciseName.trim() === '') {
                return; // User cancelled or entered nothing
            }
            
            // Check for duplicate exercise names
            const existingNames = Array.from(existingExercises).map(tab => {
                const index = tab.getAttribute('data-exercise-index');
                const inputField = document.querySelector(`#exerciseName${index}`);
                return inputField ? inputField.value.trim().toLowerCase() : '';
            });
            
            if (existingNames.includes(exerciseName.trim().toLowerCase())) {
                alert(`An exercise named "${exerciseName}" already exists. Please use a different name.`);
                return;
            }
            
            // Create new tab
            const newTab = document.createElement('button');
            newTab.type = 'button';
            newTab.className = 'exercise-tab active';
            newTab.setAttribute('data-exercise-index', exerciseIndex);
            newTab.innerHTML = `${exerciseName}
                <span class="tab-delete" data-exercise-index="${exerciseIndex}">−</span>`;
            
            // Create new content
            const newContent = document.createElement('div');
            newContent.className = 'exercise-content active';
            newContent.setAttribute('data-exercise-index', exerciseIndex);
            
            // Build the target reps section
            let targetRepsHtml = `
                <div class="target-reps-section">
                    <label for="targetReps${exerciseIndex}">Target Reps:</label>
                    <input type="number" id="targetReps${exerciseIndex}" name="targetReps[${exerciseIndex}]" value="" required>
                </div>
            `;
            
            // Build the authentication section (for admin users)
            const isAdmin = document.querySelector('.workoutEditForm').getAttribute('data-is-admin') === 'true';
            let authHtml = '';
            if (isAdmin) {
                authHtml = `
                    <div class="exercise-auth-section">
                        <button type="button" class="btn-auth-pending authenticateExerciseBtn" data-exercise-uuid="" data-exercise-name="${exerciseName}">✗ Pending</button>
                    </div>
                `;
            }
            
            newContent.innerHTML = `
                <div class="exercise-name-section">
                    <label for="exerciseName${exerciseIndex}">Exercise Name</label>
                    <input type="text" id="exerciseName${exerciseIndex}" name="exerciseName[${exerciseIndex}]" value="${exerciseName}" required>
                </div>
                ${targetRepsHtml}
                <button type="button" class="toggle-sets" data-exercise-index="${exerciseIndex}">
                    <span class="toggle-text">Show Sets</span>
                    <span class="toggle-icon">▼</span>
                </button>
                <div class="sets-container collapsed" data-exercise-index="${exerciseIndex}">
                    <div class="set-item">
                        <div class="set-header">
                            <div class="set-fields">
                                <label>Set 1 - Reps:</label>
                                <input type="number" name="reps[${exerciseIndex}][0]" value="" required>
                                <label>Set 1 - Weight (lbs):</label>
                                <input type="number" name="weight[${exerciseIndex}][0]" value="" required>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn-add-set" data-exercise-index="${exerciseIndex}">+ Add Set</button>
                </div>
                ${authHtml}
            `;
            
            // Remove active from other tabs/contents
            document.querySelectorAll('.exercise-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.exercise-content').forEach(c => c.classList.remove('active'));
            
            // Insert new tab at end of exercise-tabs container
            exerciseTabs.appendChild(newTab);
            
            // Insert new content before submit button
            const submitButton = form.querySelector('button[type="submit"]');
            form.insertBefore(newContent, submitButton);
            
            // Reattach the add exercise listener to the same button (in case we need to add another exercise)
            attachAddExerciseListener();
        });
    };

    // Initial attachment
    attachAddExerciseListener();
});

// Form submission handler
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.workoutEditForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get all form data
        const formData = new FormData(form);
        
        // Construct the workout data object
        const workoutName = formData.get('workoutName');
        const restTime = formData.get('restTime');
        const exercises = [];
        
        // Get all exercise indices
        const exerciseTabs = document.querySelectorAll('.exercise-tab');
        
        exerciseTabs.forEach((tab, exerciseIndex) => {
            const exerciseName = formData.get(`exerciseName[${exerciseIndex}]`);
            const targetReps = formData.get(`targetReps[${exerciseIndex}]`);
            
            const sets = [];
            const setItems = document.querySelectorAll(
                `.sets-container[data-exercise-index="${exerciseIndex}"] .set-item`
            );
            
            setItems.forEach((setItem, setIndex) => {
                const reps = formData.get(`reps[${exerciseIndex}][${setIndex}]`);
                const weight = formData.get(`weight[${exerciseIndex}][${setIndex}]`);
                
                if (reps && weight) {
                    sets.push({
                        setNumber: setIndex + 1,
                        reps: parseInt(reps),
                        weight: parseFloat(weight)
                    });
                }
            });
            
            if (exerciseName && sets.length > 0) {
                exercises.push({
                    name: exerciseName,
                    targetReps: targetReps ? parseInt(targetReps) : null,
                    sets: sets
                });
            }
        });
        
        // Send to backend
        try {
            const response = await fetch('/editWorkouts/edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    workoutID: document.querySelector('input[name="workoutID"]')?.value,
                    workoutName: workoutName,
                    restTime: restTime ? parseInt(restTime) : 0,
                    exercises: exercises
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Workout updated successfully!');
                window.location.href = '/myWorkouts';
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving the workout.');
        }
    });

    // Exercise authentication handler
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('authenticateExerciseBtn')) {
            e.preventDefault();
            const button = e.target;
            const exerciseUuid = button.getAttribute('data-exercise-uuid');
            const exerciseName = button.getAttribute('data-exercise-name');
            const isCurrentlyAuthenticated = button.classList.contains('btn-auth-active');
            const newAuthStatus = !isCurrentlyAuthenticated;
            
            console.log('Exercise UUID:', exerciseUuid);
            console.log('Exercise Name:', exerciseName);
            console.log('Current Auth Status:', isCurrentlyAuthenticated);
            console.log('New Auth Status:', newAuthStatus);
            
            // Check for duplicate authenticated exercises with same name
            if (newAuthStatus) {
                const allAuthButtons = document.querySelectorAll('.authenticateExerciseBtn.btn-auth-active');
                const isDuplicate = Array.from(allAuthButtons).some(btn => {
                    const btnName = btn.getAttribute('data-exercise-name');
                    const btnUuid = btn.getAttribute('data-exercise-uuid');
                    return btnName === exerciseName && btnUuid !== exerciseUuid;
                });
                
                if (isDuplicate) {
                    alert(`An exercise named "${exerciseName}" is already authenticated. You cannot authenticate another exercise with the same name.`);
                    return;
                }
            }
            
            (async () => {
                try {
                    const response = await fetch('/adminEditDash/authenticateExercise', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            exerciseUuid: exerciseUuid,
                            isAuthenticated: newAuthStatus
                        })
                    });

                    const data = await response.json();

                    if (data?.success) {
                        console.log('Exercise authentication updated');
                        // Update button UI
                        if (newAuthStatus) {
                            button.classList.remove('btn-auth-pending');
                            button.classList.add('btn-auth-active');
                            button.textContent = '✓ Authenticated';
                        } else {
                            button.classList.remove('btn-auth-active');
                            button.classList.add('btn-auth-pending');
                            button.textContent = '✗ Pending';
                        }
                    } else {
                        console.error('Failed to update exercise authentication:', data?.message);
                        alert(data?.message || 'Failed to update exercise authentication.');
                    }
                } catch (err) {
                    console.error('Request to authenticate exercise failed', err);
                    alert('Unable to reach the server. Please try again.');
                }
            })();
        }
    });
});