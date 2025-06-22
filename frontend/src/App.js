// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AccountPage from "./components/AccountPage";
import HomePage from "./components/HomePage";     
import CarListPage from "./components/CarListPage"; 
import AboutPage from "./components/AboutPage";
import LoginPage from "./components/LoginPage";
import WishlistPage from "./components/Wishlist";
import CarDetails from "./components/CarDetails";
import PaymentPage from "./components/PaymentPage";     

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> 
        <Route path="/login" element={<LoginPage />} /> 
        <Route path="/carlist" element={<CarListPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/car-details" element={<CarDetails />} /> 
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
