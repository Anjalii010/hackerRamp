const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');



registerForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const mobile = document.getElementById('reg-mobile').value;

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, mobile }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
        // Optionally, redirect or perform additional actions upon successful registration
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again(may be because this mobile number is already registered.).');
    });
});
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const mobile = document.getElementById('mobile').value;

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, mobile }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Login successful') {
            window.location.href = '../views/index.ejs';//anjali file for community
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});