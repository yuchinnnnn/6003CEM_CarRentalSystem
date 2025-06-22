// src/components/FilterSidebar.jsx
import React from 'react';
import '../styles/carlist.css'; // or a separate filter-specific CSS if needed

function FilterSidebar({ isOpen, onClose, onApply }) {
  return (
    <aside className={`sidebar ${isOpen ? '' : 'hidden'}`} id="filterSidebar">
      <button onClick={onClose} className="close-button">✖</button>
      <h2>Filter By</h2>

      <div className="filter-group">
        <label htmlFor="carType">Car Type</label>
        <select id="carType">
          <option value="">All</option>
          <option value="SUV">SUV</option>
          <option value="Sedan">Sedan</option>
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
        <label>Rental Period</label>
        <div className="date-inputs">
          <input type="date" id="startDate" />
          <span>to</span>
          <input type="date" id="endDate" />
          </div>
      </div>

      <div className="filter-group">
        <label htmlFor="carBrand">Car Brand</label>
        <select id="carBrand">
          <option value="">All</option>
          <option value="Toyota">Toyota</option>
          <option value="Honda">Honda</option>
          <option value="Ford">Ford</option>
          <option value="BMW">BMW</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="carSeats">Seats</label>
        <select id="carSeats">
          <option value="">Any</option>
          <option value="2">2</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="7">7</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="locationFilter">Location</label>
        <select id="locationFilter">
          <option value="">All Locations</option>
          <option value="Kuala Lumpur">Kuala Lumpur</option>
          <option value="Penang">Penang</option>
          <option value="Johor Bahru">Johor Bahru</option>
          <option value="Ipoh">Ipoh</option>
          <option value="Melaka">Melaka</option>
          <option value="Seremban">Seremban</option>
          <option value="Kuching">Kuching</option>
          <option value="Kota Kinabalu">Kota Kinabalu</option>
        </select>
      </div>

      <button className="apply-button" onClick={onApply}>Apply Filter</button>
    </aside>
  );
}

export default FilterSidebar;
