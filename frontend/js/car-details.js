const params = new URLSearchParams(window.location.search);

// Get data from URL
const trimId = params.get("trim_id");
const make = decodeURIComponent(params.get("make") || "");
const model = decodeURIComponent(params.get("model") || "");
const year = decodeURIComponent(params.get("year") || "2020");
const price = decodeURIComponent(params.get("price") || "");
const imageUrl = decodeURIComponent(params.get("image") || "");

// Set basic info immediately
document.getElementById("carTitle").textContent = `${make} ${model}`;
document.getElementById("carYear").textContent = `Year: ${year}`;
document.getElementById("carPrice").textContent = price ? `Price: $${price} / month` : "Price: N/A";

const carImage = document.getElementById("carImage");

// Set image first (placeholder or actual)
carImage.src = imageUrl || "https://placehold.co/600x300?text=No+Image";

// Fallback image if broken
carImage.onerror = () => {
  carImage.src = "https://placehold.co/600x300?text=No+Image";
};

// If image is a placeholder, try to re-fetch actual image
if (!imageUrl || imageUrl.includes("placehold.co")) {
  fetch(`http://localhost:5000/api/car-image?make=${make}&model=${model}&year=${year}`)
    .then(res => res.json())
    .then(data => {
      if (data.image) {
        carImage.src = data.image;
      }
    })
    .catch(err => {
      console.warn("Fallback image fetch failed:", err);
    });
}

// Fetch full car specs from trim API
fetch(`http://localhost:5000/api/trim-details/${trimId}`)
  .then(res => res.json())
  .then(data => {
    const type = data.bodies?.[0]?.type || "N/A";
    const seats = data.bodies?.[0]?.seats || "N/A";
    const fuel = data.engines?.[0]?.fuel_type || "N/A";
    const transmission = data.transmissions?.[0]?.description || "N/A";

    document.getElementById("carTypes").textContent = `Type(s): ${type}`;
    document.getElementById("carSeats").textContent = `Seats: ${seats}`;
    document.getElementById("carFuel").textContent = `Fuel: ${fuel}`;
    document.getElementById("carTransmission").textContent = `Transmission: ${transmission}`;
  })
  .catch(err => {
    console.error("Car details fetch error:", err);
  });


// Form submission
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const userId = localStorage.getItem('userId');

    if (!userId) return alert("⚠ You must be logged in to book.");
    
    const car = {
        id: params.get("id"),
        make: params.get("make"),
        model: params.get("model"),
        year: params.get("year"),
        imageUrl: params.get("image"),
        price: params.get("price")
    };

    const booking = {
    userId,
    car,
    startDate,
    endDate
    };


    const res = await fetch("http://localhost:5000/api/bookings", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
    });

    const result = await res.json();
    if (res.ok) {
    alert("✅ Booking successful!");
    window.location.href = "/";
    } else {
    alert("❌ Booking failed: " + result.message);
    }
});