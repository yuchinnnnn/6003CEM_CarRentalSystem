const carList = document.getElementById('carList');
const filterBtn = document.getElementById('applyFilter');
const loadingOverlay = document.getElementById('loadingOverlay');
loadingOverlay.style.display = "flex";
let allCars = [];
let filteredCars = [];
const carsPerPage = 10;
let currentPage = 1;

const trimDetailsCache = new Map();

const sidebar = document.getElementById('filterSidebar');
const mainContent = document.querySelector('.main-content');
const openBtn = document.getElementById('openFilterBtn');
const closeBtn = document.getElementById('closeFilterBtn');

document.getElementById('searchButton').addEventListener('click', () => {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  document.querySelectorAll('.car-card').forEach(car => {
    car.style.display = car.textContent.toLowerCase().includes(query) ? 'block' : 'none';
  });
});

openBtn.addEventListener('click', () => {
  sidebar.classList.remove('hidden');
  mainContent.classList.add('sidebar-visible');
});

closeBtn.addEventListener('click', () => {
  sidebar.classList.add('hidden');
  mainContent.classList.remove('sidebar-visible');
});

filterBtn.addEventListener('click', () => {
  applyFilters();
  renderCars(1);
  renderPagination();
  document.getElementById('filterSidebar').classList.add('hidden');
  mainContent.classList.remove('sidebar-visible');
});

function applyFilters() {
  const type = document.getElementById('carType').value.trim().toLowerCase();
  const brand = document.getElementById('carBrand').value.trim().toLowerCase();
  const seats = document.getElementById('carSeats').value;
  const location = document.getElementById('locationFilter').value;
  const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
  const maxPrice = parseInt(document.getElementById('maxPrice').value) || Infinity;

  filteredCars = allCars.filter(car => {
    const make = (car.make || '').toLowerCase();
    const msrp = car.msrp || 20000;
    const carType = (car.body_type || car.type || '').toLowerCase();
    const carSeats = parseInt(car.seats) || 0;
    const locationMatch = !location || (car.location && car.location == location);
    
    if (type && car.type !== type) return false;

    const carTypeMatch = !type || carType === type;
    const brandMatch = !brand || make === brand;
    const priceMatch = msrp / 100 >= minPrice && msrp / 100 <= maxPrice;
    const seatMatch = !seats || parseInt(seats) === carSeats;

    console.log("Filtering by:");
    console.log("Type:", type);
    console.log("Brand:", brand);
    console.log("Seats:", seats);
    console.log("Filtered Cars Count:", filteredCars.length);

    const noResultsMsg = document.querySelector('.no-results');
    if (filteredCars.length === 0) {
      noResultsMsg.classList.remove('hidden');
    } else {
      noResultsMsg.classList.add('hidden');
    }


    return carTypeMatch && brandMatch && priceMatch && locationMatch && seatMatch;
  });
}

function renderCars(page) {
  carList.innerHTML = '';
  const start = (page - 1) * carsPerPage;
  const carsToShow = filteredCars.slice(start, start + carsPerPage);

  carsToShow.forEach(car => {
    
    const make = car.make || 'Unknown';
    const model = car.name || 'Model';
    const year = car.year || '2020';
    const image = car.image || 'https://placehold.co/300x180?text=No+Image';
    const msrp = car.msrp || 25000;
    const monthlyPrice = Math.floor(msrp / 100);
    const price = Math.floor(monthlyPrice/30);
    const seats = car.seats || 4;
    const fuel = car.fuel_type || 'Gasoline';
    const transmission = car.transmission || 'Automatic';
    // for random location in Malaysia
    const assignedLocation = car.location || "Unknown";
    const imageId = `car-img-${car.id}`
    const carDetailsUrl = `/car-details?trim_id=${car.id}&make=${make}&model=${model}&year=${year}&price=${price}&image=${encodeURIComponent(image)}&location=${encodeURIComponent(assignedLocation)}`;

    const card = document.createElement('div');
    card.className = 'car-card';
    card.innerHTML = `
      <img id="${imageId}" src="${image}" alt="${make} ${model}" onerror="src='/upload/placeholder.jpg'">
      <div class="card-content">
        <h3>${make} ${model}</h3>
        <span class="year-badge">${year}</span>
        <div class="card-icons">
          <div><i>👥</i> ${seats} People</div>
          <div><i>⚡</i> ${fuel}</div>
        </div>
        <div class="card-icons">
          <div><i>🔧</i> ${transmission}</div>
        </div>
        <div class="card-icons">
          <div><i>📍</i> ${assignedLocation}</div>
        </div>
        <div class="price-rent">
          <div class="price">$${price} / day</div>
          <a href="${carDetailsUrl}" class="btn rent-now">
            <button>Rent Now</button>
          </a>
        </div>
      </div>
    `;

    carList.appendChild(card);
    
    // 🔽 Fetch image from backend and update the image element
    fetch(`http://localhost:5000/api/car-image?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`)
      .then(res => res.json())
      .then(imageData => {
        const imgEl = document.getElementById(imageId);
        if (imgEl && imageData.image) {
          imgEl.src = imageData.image;
        }
      })
      .catch(() => {
        const imgEl = document.getElementById(imageId);
        if (imgEl) {
          imgEl.src = 'https://placehold.co/300x180?text=No+Image';
        }
      });

  });

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredCars.length / carsPerPage);
  const container = document.getElementById("paginationControls");
  container.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.addEventListener("click", () => {
      currentPage = i;
      renderCars(currentPage);
    });
    container.appendChild(btn);
  }
}

// Fetch base list, then enrich each car with trim-details
fetch('http://localhost:5000/api/cars')
  .then(res => {
    if (!res.ok) throw new Error('Failed to fetch cars');
    return res.json();
  })
  .then(async response => {
    const baseCars = Array.isArray(response) ? response : response.data;

    const enriched = [];
    const maxCars = 15; // Limit to 20 cars for performance
    let index = 0;

    while (enriched.length < maxCars && index < baseCars.length) {
      const car = baseCars[index];
      index++;

      try {
        if (trimDetailsCache.has(car.id)) {
          const details = trimDetailsCache.get(car.id);
          enriched.push({
            ...car,
            msrp: details.msrp,
            seats: details.bodies?.[0]?.seats,
            fuel_type: details.engines?.[0]?.fuel_type,
            transmission: details.transmissions?.[0]?.description,
            location: details.location || "Unknown",
            type: details.bodies?.[0]?.type || "Unknown"
          });
          continue;
        }

        const res = await fetch(`http://localhost:5000/api/trim-details/${car.id}`);
        if (res.status === 402) {
          console.warn(`Skipping trim ${car.id} due to 402`);
          continue;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const details = await res.json();
        trimDetailsCache.set(car.id, details);

        enriched.push({
          ...car,
          msrp: details.msrp,
          seats: details.bodies?.[0]?.seats,
          fuel_type: details.engines?.[0]?.fuel_type,
          transmission: details.transmissions?.[0]?.description,
          location: details.location || "Unknown",
          type: details.bodies?.[0]?.type || "Unknown"
        });
      } catch (err) {
        console.warn(`Trim ${car.id} failed: ${err.message}`);
      }
    }
    allCars = enriched;
    filteredCars = allCars;
    renderCars(currentPage);
    renderPagination();
    loadingOverlay.style.display = "none"; 
  })
  .catch(err => {
    console.error('Error fetching cars:', err);
    carList.innerHTML = "<p class='error'>Failed to load cars. Try again later.</p>";
  });