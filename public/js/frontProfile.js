var saveButton = document.querySelector('main button');
saveButton.addEventListener('click', async () => {
    const username = document.querySelector('.profile-info h2 input').value;
    const password = document.querySelector('.profile-info p input').value;
    try {
        const response = await fetch('/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password })
        });
        const data = await response.json();

        if (data?.success) {
            console.log('Profile update successful');
            window.location.href = '/profile';
        } else {
            console.error('Profile update failed:', data?.message);
            alert(data?.message || 'Profile update failed. Please try again.');
        }
        } catch (err) {
            console.error('Profile update request failed', err);
            alert('Unable to reach the server. Please try again.');
        }
});