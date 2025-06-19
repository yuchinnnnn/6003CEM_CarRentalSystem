document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const userId = localStorage.getItem("userId");

  // Initial display
  document.getElementById("username").value = username; //for username input
  document.getElementById("usernameDisplay").textContent = username; //for username display
  document.getElementById("profileEmail").textContent = email || "-";
  document.getElementById("profileUserId").textContent = userId || "-";

  // Logout functionality
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    alert("You have been logged out.");
    window.location.href = "/";
  });

    // Sidebar logic
  const navItems = document.querySelectorAll(".settings-sidebar li");
  const sections = document.querySelectorAll(".setting-content > section");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");

      const target = item.getAttribute("data-target");

      sections.forEach(sec => {
        if (sec.classList.contains(target)) {
          sec.style.display = "block";
        } else {
          sec.style.display = "none";
        }
      });
    });
  });

  // Upload profile picture
  const uploadBtn = document.querySelector(".btn:not(.btn-danger)");
  const fileInput = document.getElementById("profileImageUpload");
  const profilePreview = document.getElementById("profileImagePreview");

  uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
      return alert("Please select an image.");
    }

    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("userId", userId);

    try {
      const res = await fetch("http://localhost:5000/api/account/upload-profile", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        profilePreview.src = result.imageUrl;
        alert("Profile picture updated.");
      } else {
        alert(result.message || "Failed to upload profile picture.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Error uploading image.");
    }
  });

  // Optional: Delete profile picture
  document.querySelector(".btn-danger").addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete your profile picture?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/account/delete-profile`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
      });

      const result = await res.json();
      if (res.ok) {
        profilePreview.src = "/assets/default-profile.png";
        alert("Profile picture removed.");
      } else {
        alert(result.message || "Failed to delete profile picture.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting image.");
    }
  });

});
