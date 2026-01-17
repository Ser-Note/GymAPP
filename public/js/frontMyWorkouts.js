const workoutButtons = document.querySelectorAll('[id^="btnWorkout"]');

workoutButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const workoutId = button.id.replace('btnWorkout', '');
        
        try {
            // Navigate to the workout execution page
            window.location.href = `/workingout?id=${workoutId}`;
        } catch (err) {
            console.error('Error navigating to workout:', err);
            alert('Unable to start workout. Please try again.');
        }
    });
});