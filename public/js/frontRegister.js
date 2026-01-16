const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }
        else
        {
                try {
                const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data?.success) {
                console.log('Registration successful');
                window.location.href = '/';
            } else {
                console.error('Registration failed:', data?.message);
                alert(data?.message || 'Registration failed. Please try again.');
            }
            } catch (err) {
                console.error('Registration request failed', err);
                alert('Unable to reach the server. Please try again.');
            }

        }

    });
}


