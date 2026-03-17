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
function handleLogin(event) {
    event.preventDefault(); // Prevents page reload
    
    // In the future, backend API call will go here.
    // For now, we redirect to the feed page.
    window.location.href = "feed.html";
}

// Function to handle Register Submission
function handleRegister(event) {
    event.preventDefault(); // Prevents page reload
    
    // In the future, backend API call will go here.
    alert("Registration successful! Redirecting to feed...");
    window.location.href = "feed.html";
}