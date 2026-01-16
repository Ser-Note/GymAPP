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