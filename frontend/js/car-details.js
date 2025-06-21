const params = new URLSearchParams(window.location.search);

// Get data from URL
const trimId = params.get("trim_id");
const make = decodeURIComponent(params.get("make") || "");
const model = decodeURIComponent(params.get("model") || "");
const year = decodeURIComponent(params.get("year") || "2020");
const price = decodeURIComponent(params.get("price") || "");
let imageUrl = decodeURIComponent(params.get("image") || "");
const carLocation = decodeURIComponent(params.get("location") || "");

const pickupMap = {
  "Penang": "Penang International Airport",
  "Kuala Lumpur": "KLIA Terminal 1",
  "Johor Bahru": "Senai International Airport",
  "Ipoh": "Sultan Azlan Shah Airport",
  "Melaka": "Melaka International Airport",
  "Seremban": "Seremban Central",
  "Kuching": "Kuching International Airport",
  "Kota Kinabalu": "Kota Kinabalu International Airport"
};

const fixedPickupLocation = pickupMap[carLocation] || "Main City Center";

// Display it
document.getElementById("pickupLocation").textContent = fixedPickupLocation;
document.getElementById("dropoffLocation").textContent = fixedPickupLocation;


// Set basic info immediately
document.getElementById("carTitle").textContent = `${make} ${model}`;
document.getElementById("carYear").textContent = `${year}`;
document.getElementById("carPrice").innerHTML = price
  ? `<span class=\"price-tag\">$${price}</span> / day`
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

    const userId = localStorage.getItem("userId"); // Get userId from storage
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);
    const pickupLocation = fixedPickupLocation;
    const dropoffLocation = fixedPickupLocation;
    const pickupTime = document.getElementById("pickupTime").value;
    const dropoffTime = document.getElementById("dropoffTime").value;

    const bookingMessage = document.getElementById("bookingMessage");

    if (!userId) {
      bookingMessage.textContent = "⚠ You must be logged in to book.";
      bookingMessage.style.color = "orange";
      submitBtn.disabled = false;
      submitBtn.textContent = "Confirm Booking";
      return;
    }

    if (!startDate || !endDate || endDate < startDate) {
      bookingMessage.textContent = "❌ Please select a valid date range.";
      bookingMessage.style.color = "salmon";
      submitBtn.disabled = false;
      submitBtn.textContent = "Confirm Booking";
      return;
    }

    // Validate pickup/dropoff
    if (!pickupTime || !dropoffTime) {
      bookingMessage.textContent = "❌ Please fill in all pickup/drop-off info.";
      bookingMessage.style.color = "salmon";
      submitBtn.disabled = false;
      submitBtn.textContent = "Confirm Booking";
      return;
    }

    const params = new URLSearchParams(window.location.search);
   
    const price = parseInt(params.get("price")) || 0; // 👈 convert to number

    const car = {
      id: params.get("trim_id"),
      make,
      model,
      year,
      imageUrl,
      price // now a number
    };


    const diff = endDate - startDate;
    const durationDays = Math.ceil(diff / (1000 * 3600 * 24)); // convert ms to days

    // Calculate total price
    const totalPrice = price * durationDays;

    const booking = {
      userId,
      car,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      pickupTime,
      dropoffTime,
      durationDays,
      totalPrice
    };

    // Save to localStorage and redirect to payment
    localStorage.setItem("pendingBooking", JSON.stringify(booking));
    window.location.href = "/payment"; // navigate to payment page
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

