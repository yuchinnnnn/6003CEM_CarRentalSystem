// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import '../styles/navbar.css';
import logo from '../css/assets/logo.png';

const Navbar = () => {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('username');
    if (stored) setUsername(stored);
  }, []);

  return (
    <header>
      <div className="navbar">
        <img src={logo} alt="Logo" />
        <div className="center-nav">
          <a href="/">Home</a>
          <a href="/carlist" className="active">Carlist</a>
          <a href="/about">About Us</a>
          <a id="accountLink" href={username ? "/account" : "/login"}>
            {username || "Account"}
          </a>
        </div>
        <div className="social">
          <a href="#"><i className="fa-solid fa-magnifying-glass" /></a>
          <a href="#"><i className="fa-solid fa-bookmark" /></a>
          <a href="#"><i className="fa-solid fa-bell" /></a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
