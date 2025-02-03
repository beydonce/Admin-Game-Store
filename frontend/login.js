// login.js

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {
        username: username,
        password: password
      });
  
      console.log('Response:', response);  // For debugging
      alert(response.data.message);  // Show message to user
  
      if (response.status === 200) {
        // Redirect to the game management page on successful login
        window.location.href = 'index.html';
      }
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error);
      alert('Failed to login: ' + (error.response ? error.response.data.message : 'Unknown error'));
    }
  }
  