import React from "react";
import "../styles/homepage.css";
import logo from "../css/assets/logo.png";
import cars from "../css/assets/cars.png";

function HomePage() {
  return (
    <>
      <header>
        <div className="navbar">
          <img src={logo} alt="Logo" />
          <div className="center-nav">
            <a href="/" className="active">Home</a>
            <a href="/carlist">Carlist</a>
            <a href="/about">About Us</a>
            <a id="accountLink" href="/login">Account</a>
          </div>
          <div className="social">
            <a href="#"><i className="fa-solid fa-magnifying-glass"></i></a>
            <a href="#"><i className="fa-solid fa-bookmark"></i></a>
            <a href="#"><i className="fa-solid fa-bell"></i></a>
          </div>
        </div>
      </header>

      <div className="layout">
        <div className="text">
          <h1>AutoRent <br /> Car Rental</h1>
          <p>Rent a car anytime at anywhere from anyone.</p>
          <a href="/carlist" className="btn">Get Started</a>
          <a href="/about" className="btn">Learn More</a>
        </div>
        <div className="car-toggle">
          <img src={cars} alt="Car" className="active" />
        </div>
      </div>
    </>
  );
}

export default HomePage;
