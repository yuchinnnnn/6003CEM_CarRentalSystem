document.addEventListener("DOMContentLoaded", async() => {
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  console.log("Token:", localStorage.getItem("token"));

  if(!userId || !token) {
    alert("You must be logged in to access this page.");
    return window.location.href = "/";
  }
  try {
    const res= await fetch(`http://localhost:5000/api/user/${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Failed to fetch user data:", err);
  }

  // Initial display
  document.getElementById("username").value = username; //for username input
  document.getElementById("usernameDisplay").textContent = username; //for username display
  document.getElementById("profileEmail").textContent = email || "-";
  document.getElementById("profileUserId").textContent = userId || "-";
  
  document.querySelectorAll('.toggle-visibility').forEach(icon => {
    icon.addEventListener('click', () => {
      const targetId = icon.getAttribute('data-target');
      const input = document.getElementById(targetId);

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });

  // Show fields on button click (Reset Password)
  document.getElementById("resetPasswordBtn").addEventListener("click", function (e) {
    e.preventDefault();

    // Example using SweetAlert2
    Swal.fire({
      title: 'Reset Password?',
      text: "Are you sure you want to reset your password?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6a00',
      cancelButtonColor: '#333',
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.isConfirmed) {
        document.getElementById("resetPasswordBtn").style.display = "none";
        document.getElementById("cancelPasswordChange").style.display = "block";
        document.querySelectorAll('.password-wrapper, #saveNewPassword').forEach(el => {
          el.style.display = 'block';
        });
      }
    });
  });

  // Cancel password change
  document.getElementById("cancelPasswordChange").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("resetPasswordBtn").style.display = "block";
    document.getElementById("cancelPasswordChange").style.display = "none";
    document.querySelectorAll('.password-wrapper, #saveNewPassword').forEach(el => {
      el.style.display = 'none';
    });
  });

  document.getElementById("saveNewPassword").addEventListener("click", async function (e) {
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmedPassword = document.getElementById("confirmPassword").value;

    if (!userId || !token) {
      return alert("You must be logged in to update your profile.");
    }

    // Password format validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return alert("Password must be at least 8 characters long and contain a capital letter and a symbol.");
    }

    if (newPassword !== confirmedPassword) {
      return alert("New passwords do not match.");
    }

    try {
      const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert("Password changed successfully.");
      } else {
        alert(result.message || "Failed to change password.");
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Error updating profile.");
    }
  });



  document.getElementById("saveProfileBtn").addEventListener("click", async function (e) {
    const updatedUsername = document.getElementById("username").value;

    if(!userId || !token) {
      return alert("You must be logged in to update your profile.");
    }

    try
    {
      const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          username: updatedUsername
        })
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("username", updatedUsername);
        document.getElementById("usernameDisplay").textContent = updatedUsername;
        alert("Profile updated successfully.");
      } else {
        alert(result.message || "Failed to update profile.");
      }
    }
    catch (err) {
      console.error("Update failed:", err);
      alert("Error updating profile.");
    }
  });

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
  const savedImage = localStorage.getItem("profileImage");
  const profilePreview = document.getElementById("profileImagePreview");

  if (savedImage) {
    profilePreview.src = savedImage;
  } 

  uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
      return alert("Please select an image.");
    }

    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("userId", userId);

    try {
      const res = await fetch("http://localhost:5000/api/user/upload-profile", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      console.log("Upload result:", result);
      if (res.ok) {
        if(!result.imageUrl) {
          return alert("No image URL returned from server.");
        }
        const updatedUrl = `http://localhost:5000${result.imageUrl}?t=${Date.now()}`;

        profilePreview.src = updatedUrl;
        localStorage.setItem("profileImage", updatedUrl);

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

  //history section
  let bookings = [];

  function viewBookingDetails(bookingId) {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) return alert("Booking not found.");
    const rentalDuration = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)) + 1;

    const details = `
      <p><strong>Booking ID:</strong> ${booking._id}</p>
      <p><strong>Rental Period:</strong> ${new Date(booking.startDate).toLocaleDateString()} → ${new Date(booking.endDate).toLocaleDateString()}</p>
      <p><strong>Rental Duration:</strong> ${rentalDuration} days</p>
      <p><strong>Pickup Location:</strong> ${booking.car.pickupLocation}</p>
      <p><strong>Dropoff Location:</strong> ${booking.car.dropoffLocation}</p>
      <p><strong>Pickup Time:</strong> ${new Date(booking.car.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      <p><strong>Dropoff Time:</strong> ${new Date(booking.car.dropoffTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      <p><strong>Car:</strong> ${booking.car.make} ${booking.car.model} (${booking.car.year})</p>
      <p><strong>Car Type:</strong> ${booking.car.type}</p>
      <p><strong>Price:</strong> RM ${booking.car.price}</p>
      <p><strong>Total Price:</strong> RM ${booking.totalPrice}</p>
      <p><strong>Status:</strong> ${booking.status}</p>
      <p><strong>Created At:</strong> ${new Date(booking.createdAt).toLocaleDateString()}</p>
      <img src="${booking.car.imageUrl}" alt="Car" style="width: 100%; margin-top: 1rem; border-radius: 10px;">
    `;

    document.getElementById("bookingDetails").innerHTML = details;
    document.getElementById("bookingModal").style.display = "flex";
  }

  try {
    const res = await fetch(`http://localhost:5000/api/bookings/${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error("Failed to fetch history");

    bookings = await res.json();
    console.log("History data:", bookings);

    const historySection = document.getElementById("historySection");
    const historyList = document.getElementById("historyList");
    document.getElementById("closeModal").addEventListener("click", () => {
      document.getElementById("bookingModal").style.display = "none";
    });


    if (bookings.length === 0) {
      historyList.innerHTML = "<p>No rental history found.</p>";
    } else {
      historyList.innerHTML = "";

      bookings.forEach(booking => {
        const item = document.createElement("div");
        item.className = "history-card";

        const start = new Date(booking.startDate).toLocaleDateString();
        const end = new Date(booking.endDate).toLocaleDateString();

        item.innerHTML = `
          <img src="${booking.car.imageUrl}" alt="${booking.car.make} ${booking.car.model}" class="history-image">
          <div class="history-details">
            <h3>${booking.car.make} ${booking.car.model} (${booking.car.year})</h3>
            <p><strong>Rental Dates:</strong> ${start} → ${end}</p>
            <p><strong>Total Price:</strong> RM ${booking.totalPrice}</p>
            <button onclick="viewBookingDetails('${booking._id}')">View Details</button>
          </div>
        `;

        historyList.appendChild(item);

        const button = item.querySelector("button");
        button.addEventListener("click", () => {
          viewBookingDetails(booking._id);
        })
      });
    }

    historySection.style.display = "block";

  } catch (err) {
    console.error("Failed to fetch rental history:", err);
  }

  //setting section
  const managePaymentBtn = document.getElementById("managePaymentBtn");
  const modal = document.getElementById("paymentModal");
  const closeBtn = modal.querySelector(".close");

  managePaymentBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close the modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

});
