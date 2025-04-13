// Authentication state
let currentUser = null;

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        return true;
    }
    return false;
}

// Handle tab switching
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Update active tab
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding form
        const formId = tab.getAttribute('data-tab') + '-form';
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(formId).classList.add('active');
    });
});

// Handle login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        // In a real app, this would be an API call
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Store current user
            currentUser = { ...user };
            delete currentUser.password; // Don't store password
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Redirect to main page
            window.location.href = 'index.html';
        } else {
            alert('Invalid email or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
    }
});

// Handle signup
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        // In a real app, this would be an API call
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            alert('Email already registered');
            return;
        }
        
        // Add new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Store current user
        currentUser = { ...newUser };
        delete currentUser.password; // Don't store password
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Redirect to main page
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred during signup');
    }
});

// Handle logout
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'login.html';
}

// Check authentication on page load
if (window.location.pathname.includes('index.html')) {
    if (!checkAuth()) {
        window.location.href = 'login.html';
    }
} 