const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
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
                const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data?.success) {
                console.log('Login successful');
                window.location.href = '/dashboard';
            } else {
                console.error('Login failed:', data?.message);
                alert(data?.message || 'Login failed. Please try again.');
            }
            } catch (err) {
                console.error('Login request failed', err);
                alert('Unable to reach the server. Please try again.');
            }

        }

    });
}


