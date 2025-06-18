const params = new URLSearchParams(window.location.search);

// Get data from URL
const trimId = params.get("trim_id");
const make = decodeURIComponent(params.get("make") || "");
const model = decodeURIComponent(params.get("model") || "");
const year = decodeURIComponent(params.get("year") || "2020");
const price = decodeURIComponent(params.get("price") || "");
let imageUrl = decodeURIComponent(params.get("image") || "");


// Set basic info immediately
document.getElementById("carTitle").textContent = `${make} ${model}`;
document.getElementById("carYear").textContent = `${year}`;
document.getElementById("carPrice").innerHTML = price
  ? `<span class=\"price-tag\">$${price}</span> / month`
  : "<em>Price: N/A</em>";

// Load image (fallback included)
const carImage = document.getElementById("carImage");
carImage.src = imageUrl || "https://placehold.co/600x300?text=No+Image";
carImage.onerror = () => {
  carImage.src = "https://placehold.co/600x300?text=No+Image";
};

// Try better image fetch
if (!imageUrl || imageUrl.includes("placehold.co")) {
  fetch(`http://localhost:5000/api/car-image?make=${make}&model=${model}&year=${year}`)
    .then(res => res.json())
    .then(data => {
      if (data.image) {
        carImage.src = data.image;
        imageUrl = data.image; 
      }
    })
    .catch(err => console.warn("Image fetch failed:", err));
}


// Fetch trim details
fetch(`http://localhost:5000/api/trim-details/${trimId}`)
  .then(res => res.json())
  .then(data => {
    const body = data.bodies?.[0] || {};
    const engine = data.engines?.[0] || {};
    const transmission = data.transmissions?.[0] || {};
    const drive = data.drive_types?.[0] || {};
    const mileage = data.mileages?.[0] || {};

    // Convert units
    const galToLiters = gal => gal ? (gal * 3.785).toFixed(1) : "N/A";
    const mpgToL100km = mpg => mpg ? (235.215 / mpg).toFixed(1) : "N/A";
    const inchesToCm = inch => inch ? (inch * 2.54).toFixed(1) : "N/A";

    document.getElementById("carTypes").textContent = ` ${body.type || "N/A"}`;
    document.getElementById("carSeats").textContent = ` ${body.seats || "N/A"}`;
    document.getElementById("carFuel").textContent = `${engine.fuel_type || "N/A"}`;
    document.getElementById("carTransmission").textContent = ` ${transmission.description || "N/A"}`;
    document.getElementById("carDrive").textContent = ` ${drive.description || "N/A"}`;
    document.getElementById("carMPG").textContent = ` ${mpgToL100km(mileage.combined_mpg) || "N/A"}`;
    document.getElementById("carTank").textContent = ` ${galToLiters(mileage.fuel_tank_capacity) || "N/A"} liters`;

    const specsEl = document.getElementById("carSpecs");
    specsEl.innerHTML = `
      <div class="category">Pricing</div>
      <div class="specs-grid">
        <p><strong>MSRP:</strong> $${data.msrp || "N/A"}</p>
        <p><strong>Invoice:</strong> $${data.invoice || "N/A"}</p>
      </div>

      <div class="category">Engine & Performance</div>
      <div class="specs-grid">
        <p><strong>Horsepower:</strong> ${engine.horsepower_hp || "N/A"} hp</p>
        <p><strong>Torque:</strong> ${engine.torque_ft_lbs || "N/A"} ft-lbs</p>
        <p><strong>Engine Type:</strong> ${engine.engine_type || "N/A"}</p>
        <p><strong>Cylinders:</strong> ${engine.cylinders || "N/A"}</p>
        <p><strong>Cam Type:</strong> ${engine.cam_type || "N/A"}</p>
        <p><strong>Drive Type:</strong> ${drive.description || "N/A"}</p>
        <p><strong>Transmission:</strong> ${transmission.description || "N/A"}</p>
      </div>

      <div class="category">Fuel & Efficiency</div>
      <div class="specs-grid">
        <p><strong>Combined KMPL:</strong> ${mpgToL100km(mileage.combined_mpg) || "N/A"}</p>
        <p><strong>City Consumption:</strong> ${mpgToL100km(mileage.epa_city_mpg)} L/100km</p>
        <p><strong>Highway Consumption:</strong> ${mpgToL100km(mileage.epa_highway_mpg)} L/100km</p>
      </div>

      <div class="category">Dimensions</div>
      <div class="specs-grid">
        <p><strong>Length:</strong> ${inchesToCm(body.length)} cm</p>
        <p><strong>Width:</strong> ${inchesToCm(body.width)} cm</p>
        <p><strong>Height:</strong> ${inchesToCm(body.height)} cm</p>
        <p><strong>Wheel Base:</strong> ${inchesToCm(body.wheel_base)} cm</p>
        <p><strong>Cargo Capacity:</strong> ${body.cargo_capacity || "N/A"} cu ft</p>
        <p><strong>Max Towing Capacity:</strong> ${body.max_towing_capacity || "N/A"} lbs</p>
      </div>
    `;
  })
  .catch(err => {
    console.error("Car details fetch error:", err);
  });


// Booking form
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const startInput = document.getElementById("startDate");
  const endInput = document.getElementById("endDate");
  const bookingMessage = document.getElementById("bookingMessage");
  const wishlistBtn = document.getElementById("wishlistBtn");
  const userId = localStorage.getItem('userId');

  startInput.min = today;
  endInput.min = today;

  startInput.addEventListener("change", () => {
    endInput.min = startInput.value;
  });

  if (userId) {
    fetch(`http://localhost:5000/api/wishlist`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Wishlist fetch failed: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then(data => {
        const isWished = (data?.cars || []).some(item => item.id === params.get("trim_id"));
        if (isWished) {
          wishlistBtn.textContent = "❤️ In Wishlist";
          wishlistBtn.classList.add("active");
        }
      })
      .catch(err => {
        console.error("Failed to load wishlist:", err);
      });
  }

  document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.querySelector('#bookingForm button');
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";


    const startDate = new Date(startInput.value);
    const endDate = new Date(endInput.value);

    if (!userId) {
      bookingMessage.textContent = "⚠ You must be logged in to book.";
      bookingMessage.style.color = "orange";
      return;
    }

    if (!startDate || !endDate || endDate <= startDate) {
      bookingMessage.textContent = "❌ Please select a valid date range.";
      bookingMessage.style.color = "salmon";
      return;
    }

    const car = {
      id: params.get("trim_id"),
      make,
      model,
      year,
      imageUrl,
      price
    };

    const booking = { userId, car, startDate, endDate };

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });

      const result = await res.json();
      if (res.ok) {
        bookingMessage.textContent = "✅ Booking successful!";
        bookingMessage.style.color = "lightgreen";

        // Show post-booking options
        document.getElementById("postBookingOptions").style.display = "block";

        // Hide form to avoid double booking
        document.getElementById("bookingForm").style.display = "none";

        // Option buttons
        document.getElementById("bookAnotherBtn").addEventListener("click", () => {
          window.location.href = "/carlist";
        });

        document.getElementById("viewBookingsBtn").addEventListener("click", () => {
          window.location.href = "/account"; 
        });
      } else {
        bookingMessage.textContent = "❌ Booking failed: " + result.message;
        bookingMessage.style.color = "salmon";
      }
    } catch (err) {
      bookingMessage.textContent = "❌ Network error. Try again later.";
      bookingMessage.style.color = "salmon";
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Confirm Booking";
  });
});


const wishlistBtn = document.getElementById("wishlistBtn");

wishlistBtn.addEventListener("click", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) return alert("Please log in to use wishlist.");

  const carId = params.get("trim_id");
  const car = { id: params.get("trim_id"), make, model, year, imageUrl, price };
  console.log("Toggling wishlist for car:", carId, car);
  const isWished = wishlistBtn.classList.contains("active");

  try {
    const res = await fetch(`http://localhost:5000/api/wishlist/${isWished ? 'remove' : 'add'}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify(
        isWished ? { carId } : { car }
      )
    });

    if (res.ok) {
      wishlistBtn.classList.toggle("active");
      wishlistBtn.textContent = isWished ? "🤍 Add to Wishlist" : "❤️ In Wishlist";
    } else {
      const msg = await res.json();
      alert("❌ " + msg.message);
    }
  } catch (err) {
    console.error("Wishlist error:", err);
  }
});

