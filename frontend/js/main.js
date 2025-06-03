const API_KEY = 'a2f9f09c-355e-4e43-8a70-8b6790844032';
const carList = document.getElementById('carList');

fetch('http://localhost:5000/api/cars')
  .then(res => res.json())
  .then(data => {
    console.log("Data from backend:", data);

    data.forEach(car => {
      const image = car.image?.url || 'https://via.placeholder.com/300x180?text=No+Image';
      const make = car.name || 'Unknown';
      const model = car.model || 'Model';
      const year = car.year || 'N/A';
      const msrp = car.msrp || (Math.floor(Math.random() * 20000) + 20000); // Simulate if missing

      const fuelType = car.fuel_type || 'Gasoline';
      const transmission = car.transmission || 'Automatic';
      const passengers = 4;
      const economy = (Math.random() * 5 + 4).toFixed(1); // Fake fuel economy

      const card = document.createElement('div');
      card.className = 'car-card';
      card.innerHTML = `
        <img src="${image}" alt="${make} ${model}">
        <div class="card-content">
          <h3>${make} ${model}</h3>
          <span class="year-badge">${year}</span>
          <div class="card-icons">
            <div><i>👥</i> ${passengers} People</div>
            <div><i>⚡</i> ${fuelType}</div>
          </div>
          <div class="card-icons">
            <div><i>⛽</i> ${economy}km / 1-litre</div>
            <div><i>🔧</i> ${transmission}</div>
          </div>
          <div class="price-rent">
            <div class="price">$${Math.floor(msrp / 100)} / month</div>
            <button>Rent now</button>
          </div>
        </div>
      `;
      carList.appendChild(card);
    });
  })
  .catch(err => {
    console.error('Error fetching cars:', err);
  });
