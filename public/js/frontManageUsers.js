// Toggle Options Visibility
var toggleButtons = document.querySelectorAll('.btn-toggle-options');
toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const userItem = button.closest('.user-item');
        const userOptions = userItem.querySelector('.user-options');
        const isCollapsed = userOptions.classList.contains('collapsed');
        
        userOptions.classList.toggle('collapsed');
        button.setAttribute('aria-expanded', isCollapsed);
    });
});

var authenticatedButtons = document.querySelectorAll('.btnAuthActive, .btnAuthPending');

authenticatedButtons.forEach(button => {
    button.addEventListener('click', async () => {
        if (button.classList.contains('btnAuthActive')) {
            button.classList.remove('btnAuthActive');
            button.classList.add('btnAuthPending');
            alert('User deactivation process initiated.');
        } else {
            button.classList.remove('btnAuthPending');
            button.classList.add('btnAuthActive');
            alert('User activation process initiated.');
        }

         try {
                const response = await fetch('/manageUsers/authentication', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    buttonClass: button.className,
                    username: button.closest('.user-item').querySelector('strong').innerText
                 })
            });

            const data = await response.json();

            if (data?.success) {
                console.log('Registration successful');
                window.location.href = '/manageUsers';
            } else {
                console.error('Registration failed:', data?.message);
                alert(data?.message || 'Registration failed. Please try again.');
            }
            } catch (err) {
                console.error('Registration request failed', err);
                alert('Unable to reach the server. Please try again.');
            }

    });
});

var adminButtons = document.querySelectorAll('.admin-badge, .user-badge');
adminButtons.forEach(button => {
    button.addEventListener('click', async () => {
        if (button.id === 'btnAdminActive') {
            button.id = 'btnAdminPending';
        }
        else
        {
            button.id = 'btnAdminActive';
        }

         try {
                const response = await fetch('/manageUsers/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    buttonId: button.id,
                    username: button.parentElement.querySelector('strong').innerText
                 })
            });

            const data = await response.json();

            if (data?.success) {
                console.log('Registration successful');
                window.location.href = '/manageUsers';
            } else {
                console.error('Registration failed:', data?.message);
                alert(data?.message || 'Registration failed. Please try again.');
            }
            } catch (err) {
                console.error('Registration request failed', err);
                alert('Unable to reach the server. Please try again.');
            }
    });
});


var deleteButtons = document.querySelectorAll('.btnDeleteUser');

deleteButtons.forEach(button => {
    button.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                try {
                const response = await fetch('/manageUsers/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: button.closest('.user-item').querySelector('strong').innerText
                 })
            });

            const data = await response.json();

            if (data?.success) {
                console.log('User deletion successful');
                window.location.href = '/manageUsers';
            } else {
                console.error('User deletion failed:', data?.message);
                alert(data?.message || 'User deletion failed. Please try again.');
            }
            } catch (err) {
                console.error('User deletion request failed', err);
                alert('Unable to reach the server. Please try again.');
            }
        }
    });
});

var editWorkoutButtons = document.querySelectorAll('.btnEditWorkout');
editWorkoutButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const username = button.closest('.user-item').querySelector('strong').innerText;
        
        try {
            const response = await fetch('/manageUsers/editWorkouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username })
            });

            const data = await response.json();

            if (data?.success) {
                console.log('Redirecting to admin edit dashboard');
                window.location.href = data.redirectUrl;
            } else {
                console.error('Failed to load edit workouts page:', data?.message);
                alert(data?.message || 'Failed to load edit workouts page. Please try again.');
            }
        } catch (err) {
            console.error('Edit workouts request failed', err);
            alert('Unable to reach the server. Please try again.');
        }
    });
});

// User Search Functionality
document.getElementById('userSearchButton').addEventListener('click', () => {
    const query = document.getElementById('userSearchInput').value.toLowerCase();
    const userItems = document.querySelectorAll('.user-item');

    if (!query) {
        userItems.forEach(item => {
            item.style.display = '';
        });
        return;
    }
    else
    {
        userItems.forEach(item => {
        const username = item.querySelector('strong').innerText.toLowerCase();
        if (username.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}
});