document.addEventListener("DOMContentLoaded", () => {
  const accountLink = document.getElementById("accountLink");
  const username = localStorage.getItem("username");

  if (username && accountLink) {
    accountLink.textContent = username;
    accountLink.href = "/pages/account.html";
  }
});
