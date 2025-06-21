const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "frontend"))); // change if your folder is named differently

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages", "login.html"));
});

app.get("/carlist", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages", "carlist.html"));
});

app.get("/wishlist", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages", "wishlist.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages", "about.html"));
});

app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages", "account.html"));
});

app.get("/car-details", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages", "car-details.html"));
});

app.get("/payment", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages", "payment.html"));
});

app.listen(3000, () => console.log("Frontend running at http://localhost:3000"));
