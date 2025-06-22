// src/pages/CarListPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import '../styles/carlist.css';

const CarListPage = () => {
  const [allCars, setAllCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 10;
  const trimDetailsCache = useRef(new Map());

  const carListRef = useRef(null);

  const fetchCars = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/cars');
      if (!res.ok) throw new Error('Failed to fetch cars');
      const data = await res.json();
      const baseCars = Array.isArray(data) ? data : data.data;

      const enriched = [];
      const maxCars = 15;
      let index = 0;

      while (enriched.length < maxCars && index < baseCars.length) {
        const car = baseCars[index++];
        try {
          if (trimDetailsCache.current.has(car.id)) {
            const details = trimDetailsCache.current.get(car.id);
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
          trimDetailsCache.current.set(car.id, details);

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

      setAllCars(enriched);
      setFilteredCars(enriched);
    } catch (err) {
      console.error('Error fetching cars:', err);
      if (carListRef.current) {
        carListRef.current.innerHTML = "<p class='error'>Failed to load cars. Try again later.</p>";
      }
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const applyFilters = () => {
    const type = document.getElementById('carType').value.trim().toLowerCase();
    const brand = document.getElementById('carBrand').value.trim().toLowerCase();
    const seats = document.getElementById('carSeats').value;
    const location = document.getElementById('locationFilter').value;
    const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice').value) || Infinity;

    const filtered = allCars.filter(car => {
      const make = (car.make || '').toLowerCase();
      const msrp = car.msrp || 20000;
      const carType = (car.body_type || car.type || '').toLowerCase();
      const carSeats = parseInt(car.seats) || 0;
      const locationMatch = !location || (car.location && car.location === location);
      const carTypeMatch = !type || carType === type;
      const brandMatch = !brand || make === brand;
      const priceMatch = msrp / 100 >= minPrice && msrp / 100 <= maxPrice;
      const seatMatch = !seats || parseInt(seats) === carSeats;
      return carTypeMatch && brandMatch && priceMatch && locationMatch && seatMatch;
    });

    setFilteredCars(filtered);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    const input = document.getElementById('searchInput').value.trim().toLowerCase();
    const filtered = allCars.filter(car =>
      `${car.make} ${car.name}`.toLowerCase().includes(input)
    );
    setFilteredCars(filtered);
    setCurrentPage(1);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredCars.length / carsPerPage);
    return (
      <div className="pagination-controls">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={i + 1 === currentPage ? 'active' : ''}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

  const renderCarCards = () => {
    const start = (currentPage - 1) * carsPerPage;
    const carsToShow = filteredCars.slice(start, start + carsPerPage);

    if (carsToShow.length === 0) {
      return <p className="no-results">No cars found matching the filter criteria.</p>;
    }

    return (
      <div className="car-list" ref={carListRef}>
        {carsToShow.map(car => {
          const make = car.make || 'Unknown';
          const model = car.name || 'Model';
          const year = car.year || '2020';
          const image = car.image || 'https://placehold.co/300x180?text=No+Image';
          const msrp = car.msrp || 25000;
          const price = Math.floor(Math.floor(msrp / 100) / 30);
          const seats = car.seats || 4;
          const fuel = car.fuel_type || 'Gasoline';
          const transmission = car.transmission || 'Automatic';
          const location = car.location || 'Unknown';
          const carDetailsUrl = `/car-details?trim_id=${car.id}&make=${make}&model=${model}&year=${year}&price=${price}&image=${encodeURIComponent(image)}&location=${encodeURIComponent(location)}`;

          return (
            <div className="car-card" key={car.id}>
              <img
                src={image}
                alt={`${make} ${model}`}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/300x180?text=No+Image';
                }}
              />
              <div className="card-content">
                <h3>{make} {model}</h3>
                <span className="year-badge">{year}</span>
                <div className="card-icons">
                  <div><i>👥</i> {seats} People</div>
                  <div><i>⚡</i> {fuel}</div>
                </div>
                <div className="card-icons">
                  <div><i>🔧</i> {transmission}</div>
                </div>
                <div className="card-icons">
                  <div><i>📍</i> {location}</div>
                </div>
                <div className="price-rent">
                  <div className="price">${price} / day</div>
                  <a href={carDetailsUrl} className="btn rent-now">
                    <button>Rent Now</button>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

    return (
    <>
      <Navbar />
      <div className="layout">
        <aside className="sidebar hidden" id="filterSidebar">
          <button id="closeFilterBtn" className="close-button" onClick={() => {
            document.getElementById('filterSidebar').classList.add('hidden');
            document.querySelector('.main-content').classList.remove('sidebar-visible');
          }}>✖</button>

          <h2>Filter By</h2>

          <div className="filter-group">
            <label htmlFor="carType">Car Type</label>
            <select id="carType">
              <option value="">All</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Coupe">Coupe</option>
              <option value="Convertible">Convertible</option>
              <option value="Wagon">Wagon</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Truck (Extended Cab)">Truck (Extended Cab)</option>
              <option value="Truck (Crew Cab)">Truck (Crew Cab)</option>
              <option value="Van">Van</option>
              <option value="Ext Van">Ext Van</option>
              <option value="Truck (Regular Cab)">Truck (Regular Cab)</option>
              <option value="Truck (Double Cab)">Truck (Double Cab)</option>
              <option value="Minivan">Minivan</option>
              <option value="Truck (SuperCab)">Truck (SuperCab)</option>
              <option value="Truck (SuperCrew)">Truck (SuperCrew)</option>
              <option value="Truck (King Cab)">Truck (King Cab)</option>
              <option value="Truck (Quad Cab)">Truck (Quad Cab)</option>
              <option value="Truck (Mega Cab)">Truck (Mega Cab)</option>
              <option value="Truck (Access Cab)">Truck (Access Cab)</option>
              <option value="Truck (CrewMax)">Truck (CrewMax)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-inputs">
              <input type="number" id="minPrice" placeholder="Min" />
              <span>-</span>
              <input type="number" id="maxPrice" placeholder="Max" />
            </div>
          </div>

          <div className="filter-group">
            <label for="carBrand">Car Brand</label>
            <select id="carBrand">
              <option value="">All</option>
              <option value="Acura">Acura</option>
              <option value="Alfa Romeo">Alfa Romeo</option>
              <option value="Aston Martin">Aston Martin</option>
              <option value="Audi">Audi</option>
              <option value="Bentley">Bentley</option>
              <option value="BMW">BMW</option>
              <option value="Buick">Buick</option>
              <option value="Cadillac">Cadillac</option>
              <option value="Chevrolet">Chevrolet</option>
              <option value="Chrysler">Chrysler</option>
              <option value="Dodge">Dodge</option>
              <option value="FIAT">FIAT</option>
              <option value="Ford">Ford</option>
              <option value="Genesis">Genesis</option>
              <option value="GMC">GMC</option>
              <option value="Honda">Honda</option>
              <option value="Hyundai">Hyundai</option>
              <option value="INFINITI">INFINITI</option>
              <option value="Jaguar">Jaguar</option>
              <option value="Jeep">Jeep</option>
              <option value="Kia">Kia</option>
              <option value="Lamborghini">Lamborghini</option>
              <option value="Land Rover">Land Rover</option>
              <option value="Lexus">Lexus</option>
              <option value="Lincoln">Lincoln</option>
              <option value="Lotus">Lotus</option>
              <option value="Maserati">Maserati</option>
              <option value="Mazda">Mazda</option>
              <option value="McLaren">McLaren</option>
              <option value="Mercedes-Benz">Mercedes-Benz</option>
              <option value="MINI">MINI</option>
              <option value="Mitsubishi">Mitsubishi</option>
              <option value="Nissan">Nissan</option>
              <option value="Polestar">Polestar</option>
              <option value="Porsche">Porsche</option>
              <option value="Ram">Ram</option>
              <option value="Rolls-Royce">Rolls-Royce</option>
              <option value="Subaru">Subaru</option>
              <option value="Tesla">Tesla</option>
              <option value="Toyota">Toyota</option>
              <option value="Volkswagen">Volkswagen</option>
              <option value="Volvo">Volvo</option>
              <option value="Ferrari">Ferrari</option>
              <option value="Bugatti">Bugatti</option>
            </select>
          </div>

          <div className="filter-group">
            <label for="carSeats">Seats</label>
            <select id="carSeats">
              <option value="">Any</option>
              {[2, 3, 4, 5, 6, 7, 8, 10, 12, 15].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label for="locationFilter">Location</label>
            <select id="locationFilter">
              <option value="">All Locations</option>
              {["Kuala Lumpur", "Penang", "Johor Bahru", "Ipoh", "Melaka", "Seremban", "Kuching", "Kota Kinabalu"].map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <button id="applyFilter" className="apply-button" onClick={applyFilters}>Apply Filter</button>
        </aside>

        <main className="main-content">
          <h1>Available Cars</h1>

          <div className="search-container">
            <input type="text" id="searchInput" placeholder="Search by make or model..." />
            <button id="searchButton" onClick={handleSearch}>Search</button>
          </div>

          <div className="filter-toggle-container">
            <button id="openFilterBtn" className="open-button" onClick={() => {
              document.getElementById('filterSidebar').classList.remove('hidden');
              document.querySelector('.main-content').classList.add('sidebar-visible');
            }}>Filter Options</button>
          </div>

          {renderCarCards()}
          {renderPagination()}
        </main>
      </div>
    </>
  );
};

export default CarListPage;


