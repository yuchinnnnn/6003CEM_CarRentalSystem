// CarDetails.jsx (finalized with enhancements)
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/car-details.css';

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

const CarDetails = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [carData, setCarData] = useState({});
  const [carImage, setCarImage] = useState('');
  const [wishlistActive, setWishlistActive] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [dropoffTime, setDropoffTime] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [totalPriceDisplay, setTotalPriceDisplay] = useState('');
  const [specsVisible, setSpecsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPostBookingOptions, setShowPostBookingOptions] = useState(false);

  const trimId = params.get("trim_id");
  const make = decodeURIComponent(params.get("make") || "");
  const model = decodeURIComponent(params.get("model") || "");
  const year = decodeURIComponent(params.get("year") || "2020");
  const price = parseInt(decodeURIComponent(params.get("price") || "0"));
  const imageParam = decodeURIComponent(params.get("image") || "");
  const carLocation = decodeURIComponent(params.get("location") || "");

  const fixedPickupLocation = pickupMap[carLocation] || "Main City Center";

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!imageParam || imageParam.includes("placehold.co")) {
      fetch(`http://localhost:5000/api/car-image?make=${make}&model=${model}&year=${year}`)
        .then(res => res.json())
        .then(data => setCarImage(data.image || "https://placehold.co/600x300?text=No+Image"))
        .catch(() => setCarImage("https://placehold.co/600x300?text=No+Image"));
    } else {
      setCarImage(imageParam);
    }
  }, [make, model, year, imageParam]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/trim-details/${trimId}`)
      .then(res => res.json())
      .then(setCarData)
      .catch(console.error);
  }, [trimId]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    fetch("http://localhost:5000/api/wishlist", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    })
      .then(res => res.json())
      .then(data => {
        const isWished = (data?.cars || []).some(item => item.id === trimId);
        setWishlistActive(isWished);
      })
      .catch(err => console.error("Failed to load wishlist:", err));
  }, [trimId]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end >= start) {
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const total = days * price;
        const dayLabel = days === 1 ? "1 day" : `${days} days`;
        setTotalPriceDisplay(`Duration: ${dayLabel} — Total Price: $${total}`);
        return;
      }
    }
    setTotalPriceDisplay("");
  }, [startDate, endDate, price]);

  const handleBooking = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if (!userId) return setBookingMessage("⚠ You must be logged in to book.");

    if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
      return setBookingMessage("❌ Please select a valid date range.");
    }
    if (!pickupTime || !dropoffTime) return setBookingMessage("❌ Please fill in all pickup/drop-off info.");

    const durationDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 3600 * 24)) + 1;
    const totalPrice = durationDays * price;

    const booking = {
      userId,
      car: { id: trimId, make, model, year, imageUrl: carImage, price, pickupLocation: fixedPickupLocation, dropoffLocation: fixedPickupLocation, pickupTime, dropoffTime },
      startDate,
      endDate,
      durationDays,
      totalPrice,
      status: "pending"
    };

    setIsSubmitting(true);
    setBookingMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(booking)
      });

      const result = await response.json();
      if (response.ok) {
        setBookingMessage("✅ Booking successful. Redirecting to payment...");
        localStorage.setItem("pendingBooking", JSON.stringify(result.booking));
        setShowPostBookingOptions(true);
        setTimeout(() => (window.location.href = "/payment"), 1500);
      } else {
        setBookingMessage("❌ " + result.message);
      }
    } catch (err) {
      console.error(err);
      setBookingMessage("❌ Booking failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleWishlist = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("Please log in to use wishlist.");
    const url = `http://localhost:5000/api/wishlist/${wishlistActive ? 'remove' : 'add'}`;
    const body = wishlistActive ? { carId: trimId } : { car: { id: trimId, make, model, year, imageUrl: carImage, price } };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(body)
      });
      if (res.ok) setWishlistActive(!wishlistActive);
    } catch (err) {
      console.error(err);
    }
  };

  const body = carData.bodies?.[0] || {};
  const engine = carData.engines?.[0] || {};
  const transmission = carData.transmissions?.[0] || {};
  const drive = carData.drive_types?.[0] || {};
  const mileage = carData.mileages?.[0] || {};

  const mpgToL100km = mpg => mpg ? (235.215 / mpg).toFixed(1) : "N/A";
  const galToLiters = gal => gal ? (gal * 3.785).toFixed(1) : "N/A";
  const inchesToCm = inch => inch ? (inch * 2.54).toFixed(1) : "N/A";

  return (
    <>
        <Navbar />
    <div className="container fade-in">
      <div className="details-grid">
        <div className="left-panel">
          <img id="carImage" className="car-img" src={carImage} alt="Car Image" onError={(e) => e.target.src = "https://placehold.co/600x300?text=No+Image"} />
          <div className="car-info">
            <h2 id="carTitle"><span className="badge">🚗</span>{make} {model}</h2>
            <button id="wishlistBtn" onClick={toggleWishlist}>{wishlistActive ? "❤️ In Wishlist" : "🤍 Add to Wishlist"}</button>
            <div className="car-meta">
              <p><strong>Year:</strong> <span>{year}</span></p>
              <p><strong>Price:</strong> <span>${price} / day</span></p>
              <p><strong>Type:</strong> <span>{body.type}</span></p>
              <p><strong>Seats:</strong> <span>{body.seats}</span></p>
              <p><strong>Fuel:</strong> <span>{engine.fuel_type}</span></p>
              <p><strong>Transmission:</strong> <span>{transmission.description}</span></p>
              <p><strong>Drive Type:</strong> <span>{drive.description}</span></p>
              <p><strong>KMPL:</strong> <span>{mpgToL100km(mileage.combined_mpg)}</span></p>
              <p><strong>Fuel Tank:</strong> <span>{galToLiters(mileage.fuel_tank_capacity)} liters</span></p>
            </div>
            <button onClick={() => setSpecsVisible(!specsVisible)} className="toggle-btn">{specsVisible ? "Hide Details ⬆️" : "Show More Details ⬇️"}</button>
            {specsVisible && (
              <div id="carSpecs" className="specs-section">
                <div className="category">Pricing</div>
                <div className="specs-grid">
                <p><strong>MSRP:</strong> ${carData.msrp}</p>
                <p><strong>Invoice:</strong> ${carData.invoice}</p>
                </div>

                <div className="category">Engine & Performance</div>
                <div className="specs-grid">
                <p><strong>Horsepower:</strong> {engine.horsepower_hp} hp</p>
                <p><strong>Torque:</strong> {engine.torque_ft_lbs} ft-lbs</p>
                <p><strong>Engine Type:</strong> {engine.engine_type}</p>
                <p><strong>Cylinders:</strong> {engine.cylinders}</p>
                <p><strong>Cam Type:</strong> {engine.cam_type}</p>
                <p><strong>Drive Type:</strong> {drive.description}</p>
                <p><strong>Transmission:</strong> {transmission.description}</p>
                </div>

                <div className="category">Fuel & Efficiency</div>
                <div className="specs-grid">
                <p><strong>Combined KMPL:</strong> {mpgToL100km(mileage.combined_mpg)}</p>
                <p><strong>City Consumption:</strong> {mpgToL100km(mileage.epa_city_mpg)} L/100km</p>
                <p><strong>Highway Consumption:</strong> {mpgToL100km(mileage.epa_highway_mpg)} L/100km</p>
                </div>

                <div className="category">Dimensions</div>
                <div className="specs-grid">
                <p><strong>Length:</strong> {inchesToCm(body.length)} cm</p>
                <p><strong>Width:</strong> {inchesToCm(body.width)} cm</p>
                <p><strong>Height:</strong> {inchesToCm(body.height)} cm</p>
                <p><strong>Wheel Base:</strong> {inchesToCm(body.wheel_base)} cm</p>
                <p><strong>Cargo Capacity:</strong> {body.cargo_capacity} cu ft</p>
                <p><strong>Max Towing Capacity:</strong> {body.max_towing_capacity} lbs</p>
                </div>
            </div>
            )}
          </div>
        </div>
        <div className="right-panel">
          <div className="booking-form">
            <h3>Book This Car</h3>
            <form onSubmit={handleBooking}>
              <label><i className="fa-solid fa-location-dot"></i> Pickup Location:</label>
              <span>{fixedPickupLocation}</span>
              <label><i className="fa-solid fa-location-arrow"></i> Dropoff Location:</label>
              <span>{fixedPickupLocation}</span>
              <label><i className="fa-solid fa-calendar-day"></i> Start Date:</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
              <label><i className="fa-solid fa-calendar-day"></i> End Date:</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
              <label>Pickup Time:</label>
              <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} required />
              <label>Dropoff Time:</label>
              <input type="time" value={dropoffTime} onChange={e => setDropoffTime(e.target.value)} required />
              <div style={{ fontWeight: 'bold', margin: '20px' }}>{totalPriceDisplay}</div>
              <button type="submit">Confirm Booking</button>
            </form>
            <div style={{ marginTop: '10px', fontWeight: 'bold' }}>{bookingMessage}</div>
            {showPostBookingOptions && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ fontWeight: 'bold' }}>What would you like to do next?</p>
                <button onClick={() => window.location.href = '/carlist'}>🚗 Book Another Car</button>
                <button onClick={() => window.location.href = '/bookings'}>📋 View My Bookings</button>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
    
  );
};

export default CarDetails;
