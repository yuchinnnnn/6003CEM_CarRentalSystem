document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const userId = localStorage.getItem("userId");

  document.getElementById("usernameDisplay").textContent = username || "User";
  document.getElementById("profileUsername").textContent = username || "-";
  document.getElementById("profileEmail").textContent = email || "-";
  document.getElementById("profileUserId").textContent = userId || "-";

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    alert("You have been logged out.");
    window.location.href = "/";
  });
});
