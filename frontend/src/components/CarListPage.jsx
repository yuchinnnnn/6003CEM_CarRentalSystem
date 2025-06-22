import React, { useState, useEffect } from 'react';
import FilterSidebar from './FilterSidebar';
import '../styles/carlist.css';
import '../styles/navbar.css';
import logo from '../css/assets/logo.png'; // Adjust the path as necessary

function CarListPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);    
  const [allCars, setAllCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const carsPerPage = 10;
  const trimDetailsCache = new Map();

  useEffect(() => {
    async function fetchCars() {
      try {
        const res = await fetch('http://localhost:5000/api/cars');
        if (!res.ok) throw new Error('Failed to fetch');
        const baseCars = await res.json();
        const enriched = [];

        let index = 0;
        while (enriched.length < 10 && index < baseCars.length) {
          const car = baseCars[index++];
          if (trimDetailsCache.has(car.id)) {
            enriched.push({ ...car, ...trimDetailsCache.get(car.id) });
            continue;
          }

          const detailsRes = await fetch(`http://localhost:5000/api/trim-details/${car.id}`);
          if( detailsRes.status === 402 || detailsRes.status === 204) {
            console.warn(`Skipping trim ${car.id} due to 402`);
            continue;
          }
          if (!detailsRes.ok) {
            console.warn(`Failed to fetch details for car ID ${car.id}: ${detailsRes.status}`);
            continue;
          }
          const details = await detailsRes.json();

          const enrichedCar = {
            ...car,
            msrp: details.msrp,
            seats: details.bodies?.[0]?.seats,
            fuel_type: details.engines?.[0]?.fuel_type,
            transmission: details.transmissions?.[0]?.description,
            location: details.location || 'Unknown'
          };

          trimDetailsCache.set(car.id, enrichedCar);
          enriched.push(enrichedCar);
        }

        setAllCars(enriched);
        setFilteredCars(enriched);
      } catch (err) {
        console.error('Fetch error:', err.message);
      }
    }

    async function fetchTrimDetails() {
      try {
        const res = await fetch(`http://localhost:5000/api/trim-details/${car.id}`);
         if (res.status === 402 || res.status === 204) {
          console.warn(`Skipping trim ${car.id} due to 402`);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch trim details');
        const details = await res.json();
        details.forEach(detail => {
            trimDetailsCache.set(detail.id, detail);
        });
      } catch (err) {
        console.error('Fetch trim details error:', err.message);
        }       
    }

    async function fetchImage(){
        try {
            const res = await fetch(`http://localhost:5000/api/car-image?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`);
            if (!res.ok) throw new Error('Failed to fetch car images');
            const images = await res.json();
            images.forEach(image => {
                const car = allCars.find(c => c.id === image.car_id);
                if (car) {
                    car.image = image.url;
                }
            });
        } catch (err) {
            console.error('Fetch car images error:', err.message);
        }
    }

    fetchTrimDetails(), fetchCars(), fetchImage();
  }, []);

  const handleSearch = () => {
    const filtered = allCars.filter(car =>
      `${car.make} ${car.name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCars(filtered);
    setCurrentPage(1);
  };

  const applyFilters = () => {
    // logic to filter `allCars` and update `setFilteredCars`
    setIsFilterOpen(false);
  };

  const carsToShow = filteredCars.slice((currentPage - 1) * carsPerPage, currentPage * carsPerPage);

  return (
    <>
    {/* <div className="navbar"> */}
      <header>
        <div className="navbar">
          <img src={logo} alt="Logo" />
          <div className="center-nav">
            <a href="/">Home</a>
            <a href="/carlist" className="active">Carlist</a>
            <a href="/about">About Us</a>
            <a href="/login" id="accountLink">Account</a>
          </div>
          <div className="social">
            <a href="#"><i className="fa-solid fa-magnifying-glass" /></a>
            <a href="#"><i className="fa-solid fa-bookmark" /></a>
            <a href="#"><i className="fa-solid fa-bell" /></a>
          </div>
        </div>
      </header>
    {/* </div> */}

    <div className="layout">
      <FilterSidebar 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        onApply={applyFilters} 
      />

      <main className="main-content">
        <h1>Available Cars</h1>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search by make or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div className="filter-toggle-container">
            <button 
                id="openFilterBtn" 
                className="open-button" 
                onClick={() => setIsFilterOpen(true)}>
                Filter Options
            </button>
        </div>

        <div className="car-list">
          {carsToShow.map((car, idx) => (
            <div key={idx} className="car-card">
              <img
                src={car.image || 'https://placehold.co/300x180?text=No+Image'}
                alt={`${car.make} ${car.name}`}
              />
              <div className="card-content">
                <h3>{car.make} {car.name}</h3>
                <span className="year-badge">{car.year}</span>
                <div className="card-icons">
                  <div>👥 {car.seats || 4} People</div>
                  <div>⚡ {car.fuel_type || 'Gasoline'}</div>
                  <div>🔧 {car.transmission || 'Automatic'}</div>
                  <div>📍 {car.location}</div>
                </div>
                <div className="price-rent">
                  <div className="price">${Math.floor(car.msrp / 3000)} / day</div>
                  <a
                    className="btn rent-now"
                    href={`/car-details?trim_id=${car.id}&make=${car.make}&model=${car.name}`}
                  >
                    <button>Rent Now</button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination-controls">
          {Array.from({ length: Math.ceil(filteredCars.length / carsPerPage) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={i + 1 === currentPage ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
    </>
  );
}

export default CarListPage;