const API_KEY = 'a2f9f09c-355e-4e43-8a70-8b6790844032';
const carList = document.getElementById('carList');

document.getElementById('searchButton').addEventListener('click', () => {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const cars = document.querySelectorAll('.car-card'); // assuming each car is rendered in a div with class "car-card"

  cars.forEach(car => {
    const text = car.textContent.toLowerCase();
    car.style.display = text.includes(query) ? 'block' : 'none';
  });
});


document.getElementById('filterButton').addEventListener('click', () => {
  const filterOptions = document.getElementById('filterOptions');
  filterOptions.classList.toggle('show');
});


fetch('http://localhost:5000/api/cars')
  .then(res => res.json())
  .then(data => {
    console.log("Data from backend:", data);

    data.forEach(car => {
           
      const make = car.make || 'Unknown';
      const model = car.name || 'Model';
      const year = car.year || 'N/A';
      const imageId = `car-img-${make}-${model}-${year}`.replace(/\s+/g, '-'); // sanitize for id
      const image = car.image || 'https://placehold.co/300x180?text=Loading...&font=roboto';
      const imgEl = document.getElementById(imageId);
      if (imgEl && imageData.image) {
        imgEl.src = imageData.image;
      }
      const msrp = car.msrp || (Math.floor(Math.random() * 20000) + 20000); // Simulate if missing

      const fuelType = car.fuel_type || 'Gasoline';
      const transmission = car.transmission || 'Automatic';
      const passengers = Array.isArray(car.seats) ? car.seats[0] : (car.seats || 4);
      const economy = (Math.random() * 5 + 4).toFixed(1); // Fake fuel economy
      
      const card = document.createElement('div');
      card.className = 'car-card';
      card.innerHTML = `
        <img id="${imageId}" src="${image}" alt="${make} ${model}">
        <div class="card-content">
          <h3>${make} ${model}</h3>
          <span class="year-badge">${year}</span>
          <div class="card-icons">
            <div><i>👥</i> <span id="seats-${imageId}">Loading...</span> People</div>
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

            // ✅ Fetch car seats from /api/car-details
    fetch(`http://localhost:5000/api/car-details?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`)
        .then(res => res.json())
        .then(detailData => {
          const seatEl = document.getElementById(`seats-${imageId}`);
          if (seatEl && Array.isArray(detailData.seats)) {
            seatEl.textContent = detailData.seats[0];
          } else if (seatEl) {
            seatEl.textContent = detailData.seats || 'N/A';
          }
        })
        .catch(() => {
          const seatEl = document.getElementById(`seats-${imageId}`);
          if (seatEl) {
            seatEl.textContent = 'N/A';
          }
        });

    });





      // // Then fetch image separately
      // if (make && model && year) {
      //   fetch(`http://localhost:5000/api/car-image?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`)
      //     .then(res => res.json())
      //     .then(imageData => {
      //       const imgEl = document.getElementById(`car-img-${make}-${model}-${year}`);
      //       if (imgEl) {
      //         imgEl.src = imageData.image;
      //       }
      //     })
      //     .catch(() => {
      //       const imgEl = document.getElementById(`car-img-${make}-${model}-${year}`);
      //       if (imgEl) {
      //         imgEl.src = 'https://placehold.co/300x180?text=No+Image';
      //       }
      //     });
      // } else {
      //   const imgEl = document.getElementById(`car-img-${make}-${model}-${year}`);
      //   if (imgEl) {
      //     imgEl.src = 'https://placehold.co/300x180?text=No+Image';
      //   }
      // }

  })
  .catch(err => {
    console.error('Error fetching cars:', err);
  });
;
