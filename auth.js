// Function to toggle between Login and Register forms
function toggleAuth(type) {
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if (type === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
    }
}

// Function to handle Login Submission
async function handleLogin(event) {
    event.preventDefault(); 
    
    // Grab the values from the login form inputs
    const email = event.target.querySelector('input[type="email"]').value;
    const password = event.target.querySelector('input[type="password"]').value;

    try {
        // Send POST request to backend
        const response = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('annexlink_token', data.token);
            localStorage.setItem('annexlink_user', JSON.stringify(data));
            
            alert('Login Successful! Welcome ' + data.name);

            // ADMIN ROUTING
            if (data.role === 'admin') {
                window.location.href = "admin.html";
            } else {
                window.location.href = "feed.html";
            }
        }
        else {
            // FAILED (Wrong password, banned, etc.)
            alert('Login Failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Server error. Make sure your backend is running!');
    }
}

// Function to handle Register Submission
async function handleRegister(event) {
    event.preventDefault(); 
    
    // Grab all input fields from the register form
    const inputs = event.target.querySelectorAll('input');
    const name = inputs[0].value;
    const email = inputs[1].value;
    const department = inputs[2].value;
    const batch = inputs[3].value;
    const skillsString = inputs[4].value; // "Design, Java, Python"
    const password = inputs[5].value;

    // Convert comma-separated string into an array of skills
    const skillsArray = skillsString.split(',').map(skill => skill.trim()).filter(skill => skill !== "");

    try {
        // Send POST request to backend
        const response = await fetch('http://localhost:8000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                department,
                batch,
                skills: skillsArray
            })
        });

        const data = await response.json();

        if (response.ok) {
            // SUCCESS! Save token and user info
            localStorage.setItem('annexlink_token', data.token);
            localStorage.setItem('annexlink_user', JSON.stringify(data));
            
            alert('Registration Successful! Redirecting to feed...');
            window.location.href = "feed.html";
        } else {
            // FAILED (Email already exists, etc.)
            alert('Registration Failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Server error. Make sure your backend is running!');
    }
}

// Check if user is already logged in when they open the page
window.onload = () => {
    const token = localStorage.getItem('annexlink_token');
    if (token) {
        // If they already have a token, instantly send them to the feed!
        window.location.href = "feed.html";
    }
}