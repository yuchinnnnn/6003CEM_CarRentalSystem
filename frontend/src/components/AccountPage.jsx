// src/components/AccountPage.jsx
import React, { useEffect, useState } from "react";
// import Swal from "sweetalert2";
import "../styles/account.css"; // make sure you move your account.css here
import "../styles/navbar.css"; // assuming you make the navbar a component

const AccountPage = () => {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "-");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [bookings, setBookings] = useState([]);
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || "/assets/default-profile-pic.jpg");
  const [viewSection, setViewSection] = useState("profile");

  useEffect(() => {
    if (!userId || !token) {
      alert("You must be logged in to access this page.");
      window.location.href = "/";
    }

    fetchBookingHistory();
  }, []);

  const fetchBookingHistory = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Fetch booking history failed:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    alert("You have been logged out.");
    window.location.href = "/";
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      const result = await res.json();
      if (res.ok) {
        localStorage.setItem("username", username);
        alert("Profile updated successfully.");
      } else {
        alert(result.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Error updating profile.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return alert("Please select an image.");

    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("userId", userId);

    try {
      const res = await fetch("http://localhost:5000/api/user/upload-profile", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        const updatedUrl = `http://localhost:5000${result.imageUrl}?t=${Date.now()}`;
        setProfileImage(updatedUrl);
        localStorage.setItem("profileImage", updatedUrl);
        alert("Profile picture updated.");
      } else {
        alert(result.message || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Error uploading image.");
    }
  };

  return (
    <div className="account-container">
      <Navbar />
      <h1>Welcome, {username}</h1>
      <div className="settings-layout">
        <nav className="settings-sidebar">
          <ul>
            <li onClick={() => setViewSection("profile")} className={viewSection === "profile" ? "active" : ""}>
              <i className="fas fa-user"></i> Profile
            </li>
            <li onClick={() => setViewSection("history")} className={viewSection === "history" ? "active" : ""}>
              <i className="fas fa-history"></i> History
            </li>
          </ul>
        </nav>

        <div className="setting-content">
          {viewSection === "profile" && (
            <section className="profile-settings">
              <h2>Profile Settings</h2>
              <div className="profile-picture-container">
                <img src={profileImage} alt="Profile" className="profile-image" />
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </div>

              <div className="form-row">
                <label>
                  Username
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-group">
                <label>Email: {email}</label>
                <label>User ID: {userId}</label>
              </div>

              <div className="save-section">
                <button onClick={handleSaveProfile} className="btn btn-primary">💾 Save changes</button>
                <button onClick={handleLogout}>🚪 Log out</button>
              </div>
            </section>
          )}

          {viewSection === "history" && (
            <section className="history-section">
              <h2>Rental History</h2>
              {bookings.length === 0 ? (
                <p>No rental history found.</p>
              ) : (
                bookings.map((booking) => (
                  <div className="history-card" key={booking._id}>
                    <img src={booking.car.imageUrl} alt={`${booking.car.make} ${booking.car.model}`} className="history-image" />
                    <div className="history-details">
                      <h3>{booking.car.make} {booking.car.model} ({booking.car.year})</h3>
                      <p><strong>Rental Dates:</strong> {new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}</p>
                      <p><strong>Price:</strong> RM {booking.car.price}</p>
                    </div>
                  </div>
                ))
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
