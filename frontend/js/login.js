// frontend/js/login.js
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      document.getElementById('message').style.color = 'green';
      document.getElementById('message').textContent = 'Login successful!';
      
      // Redirect to carlist page
      setTimeout(() => {
        window.location.href = 'carlist.html';
      }, 1000);
    } else {
      document.getElementById('message').textContent = data.msg || 'Login failed.';
    }
  } catch (err) {
    document.getElementById('message').textContent = 'Server error. Try again later.';
  }
});
