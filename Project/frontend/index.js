let authToken = '';

// Function to handle login
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
  .then(response => response.json())
  .then(data => {
    authToken = data.token;
    document.getElementById('registration').style.display = 'none';
    document.getElementById('productForm').style.display = 'block';
    fetchAllProducts(); // Fetch products after successful login
  })
  .catch(error => console.error('Error during login:', error));
}

// Function to handle user registration
function registerUser() {
  const registerUsername = document.getElementById('registerUsername').value;
  const registerPassword = document.getElementById('registerPassword').value;

  fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: registerUsername, password: registerPassword }),
  })
  .then(response => response.json())
  .then(data => {
    console.log('User registered:', data);
    // Automatically login the newly registered user
    loginNewUser(registerUsername, registerPassword);
  })
  .catch(error => console.error('Error during user registration:', error));
}

// Function to show registration form
function showRegistrationForm() {
  document.getElementById('authentication').style.display = 'none';
  document.getElementById('registration').style.display = 'block';
}

// Function to handle login for newly registered user
function loginNewUser(username, password) {
  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
  .then(response => response.json())
  .then(data => {
    authToken = data.token;
    document.getElementById('registration').style.display = 'none';
    document.getElementById('productForm').style.display = 'block';
    fetchAllProducts(); // Fetch products after successful login
  })
  .catch(error => console.error('Error during login:', error));
}