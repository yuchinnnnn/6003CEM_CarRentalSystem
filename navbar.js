document.addEventListener("DOMContentLoaded", () => {
  const accountLink = document.getElementById("accountLink");
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (accountLink) {
    if (username && token) {
      accountLink.textContent = username;
      accountLink.href = "/account";
    } else {
      accountLink.textContent = "Login / Sign Up";
      accountLink.href = "/login";
    }
  }
});