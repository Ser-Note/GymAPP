// Tab-based exercise view with sets management
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.workoutEditForm');
    const usesNewStructure = form.getAttribute('data-uses-new-structure') === 'true';

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

    // Legacy: Delete exercise from tab
    if (!usesNewStructure) {
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

        // Legacy: Toggle sets functionality
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

        // Legacy: Delete set functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete-set')) {
                e.preventDefault();
                e.target.closest('.set-item').remove();
            }
        });

        // Legacy: Add set functionality
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

        // Legacy: Add exercise functionality
        const attachAddExerciseListener = () => {
            const addExerciseBtn = document.querySelector('.btn-add-exercise-tab');
            if (!addExerciseBtn) return;

            const newBtn = addExerciseBtn.cloneNode(true);
            addExerciseBtn.parentNode.replaceChild(newBtn, addExerciseBtn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const exerciseTabs = document.querySelector('.exercise-tabs');
                const existingExercises = document.querySelectorAll('.exercise-tab');
                const exerciseIndex = existingExercises.length;
                
                const exerciseName = prompt('Enter exercise name:');
                if (!exerciseName || exerciseName.trim() === '') {
                    return;
                }
                
                const existingNames = Array.from(existingExercises).map(tab => {
                    const index = tab.getAttribute('data-exercise-index');
                    const inputField = document.querySelector(`#exerciseName${index}`);
                    return inputField ? inputField.value.trim().toLowerCase() : '';
                });
                
                if (existingNames.includes(exerciseName.trim().toLowerCase())) {
                    alert(`An exercise named "${exerciseName}" already exists.`);
                    return;
                }
                
                const newTab = document.createElement('button');
                newTab.type = 'button';
                newTab.className = 'exercise-tab active';
                newTab.setAttribute('data-exercise-index', exerciseIndex);
                newTab.innerHTML = `${exerciseName}
                    <span class="tab-delete" data-exercise-index="${exerciseIndex}">−</span>`;
                
                const newContent = document.createElement('div');
                newContent.className = 'exercise-content active';
                newContent.setAttribute('data-exercise-index', exerciseIndex);
                
                const targetRepsHtml = `
                    <div class="target-reps-section">
                        <label for="targetReps${exerciseIndex}">Target Reps:</label>
                        <input type="number" id="targetReps${exerciseIndex}" name="targetReps[${exerciseIndex}]" value="" required>
                    </div>
                `;
                
                const isAdmin = form.getAttribute('data-is-admin') === 'true';
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
                
                document.querySelectorAll('.exercise-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.exercise-content').forEach(c => c.classList.remove('active'));
                
                exerciseTabs.appendChild(newTab);
                
                const submitButton = form.querySelector('button[type="submit"]');
                form.insertBefore(newContent, submitButton);
                
                attachAddExerciseListener();
            });
        };

        attachAddExerciseListener();
    }
});

// Form submission handler
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.workoutEditForm');
    const usesNewStructure = form.getAttribute('data-uses-new-structure') === 'true';
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const workoutID = document.querySelector('input[name="workoutID"]').value;
        const workoutName = document.querySelector('input[name="workoutName"]').value;
        const restTime = document.querySelector('input[name="restTime"]').value;
        const exercises = [];
        
        if (usesNewStructure) {
            // New structure: Collect from planned_sets, planned_reps, notes
            document.querySelectorAll('.exercise-content').forEach((content, index) => {
                const exerciseName = content.querySelector(`[name="exerciseName[${index}]"]`)?.value;
                const exerciseId = content.querySelector('[data-exercise-id]')?.getAttribute('data-exercise-id');
                const plannedSets = parseInt(content.querySelector(`[name="plannedSets[${index}]"]`)?.value) || 3;
                const plannedReps = content.querySelector(`[name="plannedReps[${index}]"]`)?.value || '10';
                const notes = content.querySelector(`[name="notes[${index}]"]`)?.value || '';
                
                if (exerciseName && exerciseId) {
                    exercises.push({
                        id: exerciseId,
                        name: exerciseName,
                        plannedSets: plannedSets,
                        plannedReps: plannedReps,
                        notes: notes
                    });
                }
            });
        } else {
            // Legacy structure: Collect from sets details
            const exerciseTabs = document.querySelectorAll('.exercise-tab');
            
            exerciseTabs.forEach((tab, exerciseIndex) => {
                const exerciseName = document.querySelector(`[name="exerciseName[${exerciseIndex}]"]`)?.value;
                const targetReps = document.querySelector(`[name="targetReps[${exerciseIndex}]"]`)?.value;
                
                const sets = [];
                const setItems = document.querySelectorAll(
                    `.sets-container[data-exercise-index="${exerciseIndex}"] .set-item`
                );
                
                setItems.forEach((setItem, setIndex) => {
                    const reps = document.querySelector(`[name="reps[${exerciseIndex}][${setIndex}]"]`)?.value;
                    const weight = document.querySelector(`[name="weight[${exerciseIndex}][${setIndex}]"]`)?.value;
                    
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
        }
        
        // Send to backend
        try {
            const response = await fetch('/editWorkouts/edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    workoutID: workoutID,
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
});