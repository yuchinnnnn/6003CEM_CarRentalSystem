const bookingData = JSON.parse(localStorage.getItem("pendingBooking"));
const carSummary = document.getElementById("carSummary");

if (!bookingData) {
  carSummary.innerHTML = "<p>No booking information found.</p>";
  document.querySelector(".payment-form").style.display = "none";
} else {
  carSummary.innerHTML = `
    <p><strong>Car:</strong> ${bookingData.car.make} ${bookingData.car.model}</p>
    <p><strong>From:</strong> ${new Date(bookingData.startDate).toLocaleDateString()} ${bookingData.pickupTime}</p>
    <p><strong>To:</strong> ${new Date(bookingData.endDate).toLocaleDateString()} ${bookingData.dropoffTime}</p>
    <p><strong>Pickup:</strong> ${bookingData.pickupLocation}</p>
    <p><strong>Drop-off:</strong> ${bookingData.dropoffLocation}</p>
    <p><strong>Price:</strong> RM ${bookingData.totalPrice || "TBD"}</p>
  `;
}

document.getElementById("payNow").addEventListener("click", async () => {
  const payBtn = document.getElementById("payNow");
  const loadingMsg = document.getElementById("loadingMsg");

  payBtn.disabled = true;
  loadingMsg.style.display = "block";

  try {
    // 1️⃣ Example: get user info from localStorage or fetch from /api/me
    const userInfo = {
      name: localStorage.getItem("username") || "Customer",
      email: localStorage.getItem("email") || "example@email.com",
      phone: localStorage.getItem("phone") || "0123456789"
    };

    // 2️⃣ Combine bookingData + userInfo
    const requestPayload = {
      ...bookingData,
      userInfo // ✅ Pass to backend
    };

    // 3️⃣ Send to backend
    const res = await fetch("http://localhost:5000/api/payment/create-toyyib-bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload)
    });

    const data = await res.json();

    if (res.ok && data?.billCode) {
      // 4️⃣ Redirect to ToyyibPay
      window.location.href = `https://toyyibpay.com/${data.billCode}`;
    } else {
      alert("❌ Failed to create payment session.");
      console.error(data);
    }
  } catch (err) {
    alert("❌ Network error. Please try again.");
    console.error(err);
  }

  payBtn.disabled = false;
  loadingMsg.style.display = "none";
});
