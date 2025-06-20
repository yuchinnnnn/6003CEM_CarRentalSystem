const carList = document.getElementById('carList');
const filterBtn = document.getElementById('applyFilter');
let allCars = [];
let filteredCars = [];
const carsPerPage = 10;
let currentPage = 1;

const trimDetailsCache = new Map();


document.getElementById('searchButton').addEventListener('click', () => {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  document.querySelectorAll('.car-card').forEach(car => {
    car.style.display = car.textContent.toLowerCase().includes(query) ? 'block' : 'none';
  });
});

document.getElementById('closeFilterBtn').addEventListener('click', () => {
  document.getElementById('filterSidebar').classList.add('hidden');
});
document.getElementById('openFilterBtn').addEventListener('click', () => {
  document.getElementById('filterSidebar').classList.remove('hidden');
});

filterBtn.addEventListener('click', () => {
  applyFilters();
  renderCars(1);
  renderPagination();
  document.getElementById('filterSidebar').classList.add('hidden');
});

function applyFilters() {
  const type = document.getElementById('carType').value;
  const brand = document.getElementById('carBrand').value;
  const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
  const maxPrice = parseInt(document.getElementById('maxPrice').value) || Infinity;

  filteredCars = allCars.filter(car => {
    const make = car.make || 'Unknown';
    const msrp = car.msrp || 20000;
    const carTypeMatch = !type || (car.body_type || '').toLowerCase() === type.toLowerCase();
    const brandMatch = !brand || make.toLowerCase() === brand.toLowerCase();
    const priceMatch = msrp / 100 >= minPrice && msrp / 100 <= maxPrice;
    return carTypeMatch && brandMatch && priceMatch;
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
    const price = Math.floor(msrp / 100);
    const seats = car.seats || 4;
    const fuel = car.fuel_type || 'Gasoline';
    const transmission = car.transmission || 'Automatic';

    const imageId = `car-img-${car.id}`
    const carDetailsUrl = `/car-details?trim_id=${car.id}&make=${make}&model=${model}&year=${year}&price=${price}&image=${encodeURIComponent(image)}`;

    const card = document.createElement('div');
    card.className = 'car-card';
    card.innerHTML = `
      <img id="${imageId}" src="${image}" alt="${make} ${model}">
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
        <div class="price-rent">
          <div class="price">$${price} / month</div>
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
  // .then(async baseCars => {
  .then(async response => {
    const baseCars = Array.isArray(response) ? response : response.data;

    const enriched = [];
    const maxCars = 10;
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
            transmission: details.transmissions?.[0]?.description
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
          transmission: details.transmissions?.[0]?.description
        });
      } catch (err) {
        console.warn(`Trim ${car.id} failed: ${err.message}`);
      }
    }
    allCars = enriched;
    filteredCars = allCars;
    renderCars(currentPage);
    renderPagination();
  })
  .catch(err => {
    console.error('Error fetching cars:', err);
    carList.innerHTML = "<p class='error'>Failed to load cars. Try again later.</p>";
  });