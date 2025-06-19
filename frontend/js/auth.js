// ----- UI Switching Logic (from login.js) -----
const loginForm = document.querySelector(".login-form");
const registerForm = document.querySelector(".register-form");
const wrapper = document.querySelector(".wrapper");
const loginTitle = document.querySelector(".title-login");
const registerTitle = document.querySelector(".title-register");

function loginFunction() {
  loginForm.style.left = "50%";
  loginForm.style.opacity = 1;
  registerForm.style.left = "150%";
  registerForm.style.opacity = 0;
  wrapper.style.height = "500px";
  loginTitle.style.top = "50%";
  loginTitle.style.opacity = 1;
  registerTitle.style.top = "50px";
  registerTitle.style.opacity = 0;
}

function registerFunction() {
  loginForm.style.left = "-50%";
  loginForm.style.opacity = 0;
  registerForm.style.left = "50%";
  registerForm.style.opacity = 1;
  wrapper.style.height = "580px";
  loginTitle.style.top = "-60px";
  loginTitle.style.opacity = 0;
  registerTitle.style.top = "50%";
  registerTitle.style.opacity = 1;
}

document.querySelectorAll(".show-pass").forEach(button => {
  const targetId = button.dataset.target;
  const input = document.getElementById(targetId);

  button.addEventListener("mousedown", () => {
    input.type = "text";
  });

  button.addEventListener("mouseup", () => {
    input.type = "password";
  });

  button.addEventListener("mouseleave", () => {
    input.type = "password";
  });
});

// ----- Utility: Decode JWT to get user ID -----
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64);
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to parse JWT", e);
    return null;
  }
}

// ----- LOGIN Handler -----
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (res.ok) {
  const token = result.token;
  const decoded = parseJwt(token);

  if (decoded && decoded.id) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", decoded.id);
    localStorage.setItem("email", data.email);

    try {
      const userRes = await fetch(`http://localhost:5000/api/user/${decoded.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = await userRes.json();
      console.log("User data:", user);
      if (user.username) {
        localStorage.setItem("username", user.username);
      }
    } catch (err) {
      console.warn("Could not fetch username:", err);
    }
  }

  alert("✅ Login successful");
  window.location.href = "/";
} else {
      alert(`❌ Login failed: ${result.message}`);
    }
  } catch (err) {
    alert("⚠️ Login error: " + err.message);
  }
});

// ----- REGISTER Handler -----
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(registerForm);
  const data = Object.fromEntries(formData.entries());

  // Step 1: Validate email via your backend (MailboxLayer)
  try {
    const emailCheckRes = await fetch(`http://localhost:5000/api/validate-email?email=${encodeURIComponent(data.email)}`);
    const emailCheck = await emailCheckRes.json();

    if (!emailCheck.format_valid || !emailCheck.smtp_check) {
      alert("❌ Please enter a valid email address.");
      return; // Stop registration if email is invalid
    }
  } catch (error) {
    alert("⚠️ Failed to validate email. Please try again.");
    return;
  }

// Step 2: Proceed with registration
  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (res.ok) {
      alert("✅ Registered successfully!");
      loginFunction(); // switch to login view
    } else {
      alert(`❌ Registration failed: ${result.message || result.error}`);
    }
  } catch (err) {
    alert("⚠️ Registration error: " + err.message);
  }
});