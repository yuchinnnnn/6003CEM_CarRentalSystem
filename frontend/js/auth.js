// frontend/js/auth.js

// Tab switching
document.getElementById('login-tab').addEventListener('click', () => {
  setActiveTab('login');
});
document.getElementById('signup-tab').addEventListener('click', () => {
  setActiveTab('signup');
});

function setActiveTab(tab) {
  document.getElementById('login-form').classList.remove('active');
  document.getElementById('signup-form').classList.remove('active');
  document.getElementById('login-tab').classList.remove('active');
  document.getElementById('signup-tab').classList.remove('active');

  document.getElementById(`${tab}-form`).classList.add('active');
  document.getElementById(`${tab}-tab`).classList.add('active');
}

async function signup() {
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  const msg = document.getElementById('signup-msg');

  try {
    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok) {
      msg.style.color = 'green';
      msg.textContent = 'Signup successful! Please login.';
      setTimeout(() => setActiveTab('login'), 1000);
    } else {
      msg.textContent = data.msg || 'Signup failed.';
    }
  } catch (err) {
    msg.textContent = 'Server error.';
  }
}

async function login() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const msg = document.getElementById('login-msg');

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', email);
      msg.style.color = 'green';
      msg.textContent = 'Login successful!';
      setTimeout(() => {
        window.location.href = 'carlist.html';
      }, 1000);
    } else {
      msg.textContent = data.msg || 'Login failed.';
    }
  } catch (err) {
    msg.textContent = 'Server error.';
  }
}
