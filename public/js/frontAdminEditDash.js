const workoutEditForm = document.getElementById('workoutEditForm');

if(workoutEditForm) {
    workoutEditForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        workoutID = document.getElementById('workoutID').value;
        console.log("Workout ID to edit: " + workoutID);

        if(!workoutID) {
            alert("Please enter a valid Workout ID.");
            return false;
        }
        else
        {
            try {
                const response = await fetch('/editWorkouts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ workoutID })
                });

                const data = await response.json();

                if (data?.success) {
                    console.log('Redirecting to edit workout page');
                    window.location.href = '/editWorkouts';
                } else {
                    console.error('Failed to load edit workout page:', data?.message);
                    alert(data?.message || 'Failed to load edit workout page. Please try again.');
                }
            } catch (err) {
                console.error('Request to load edit workout page failed', err);
                alert('Unable to reach the server. Please try again.');

            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.deleteWorkoutButton').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const workoutID = button.closest('form').querySelector('.workoutID').value;
            const workoutName = button.closest('form').querySelector('h2')?.textContent || 'this workout';
            
            // Confirmation dialog
            const confirmed = window.confirm(`Are you sure you want to delete "${workoutName}"? This cannot be undone.`);
            if (!confirmed) {
                return;
            }
            
            console.log("Workout ID to delete: " + workoutID);
            if(!workoutID) {
                alert("Please enter a valid Workout ID.");
                return false;
            }
            else
            {
                try {
                    const response = await fetch('/adminEditDash/delete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ workoutID })
                    });
                    const data = await response.json();

                    if (data?.success) {
                        console.log('Workout deleted successfully');
                        window.location.reload();
                    } else {
                        console.error('Failed to delete workout:', data?.message);
                        alert(data?.message || 'Failed to delete workout. Please try again.');
                    }
                } catch (err) {
                    console.error('Request to delete workout failed', err);
                    alert('Unable to reach the server. Please try again.');
                }
            }
        });
    });
});
