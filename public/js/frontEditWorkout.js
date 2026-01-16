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
            
            // Create new tab
            const newTab = document.createElement('button');
            newTab.type = 'button';
            newTab.className = 'exercise-tab active';
            newTab.setAttribute('data-exercise-index', exerciseIndex);
            newTab.innerHTML = `New Exercise ${exerciseIndex + 1}
                <span class="tab-delete" data-exercise-index="${exerciseIndex}">−</span>`;
            
            // Create new content
            const newContent = document.createElement('div');
            newContent.className = 'exercise-content active';
            newContent.setAttribute('data-exercise-index', exerciseIndex);
            newContent.innerHTML = `
                <div class="exercise-name-section">
                    <label for="exerciseName${exerciseIndex}">Exercise Name</label>
                    <input type="text" id="exerciseName${exerciseIndex}" name="exerciseName[${exerciseIndex}]" value="" required>
                </div>
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
});