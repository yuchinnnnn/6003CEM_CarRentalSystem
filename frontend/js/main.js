// frontend/js/main.js

// Simulated car data (replace with real API later)
const cars = [
  { model: "Toyota Camry", price: "$40/day", image: "assets/camry.jpg" },
  { model: "Honda Civic", price: "$35/day", image: "assets/civic.jpg" },
  { model: "BMW X5", price: "$90/day", image: "assets/bmw.jpg" },
  { model: "Tesla Model 3", price: "$120/day", image: "assets/tesla.jpg" }
];

const container = document.getElementById("car-container");

if (container) {
  cars.forEach(car => {
    const card = document.createElement("div");
    card.className = "car-card";
    card.innerHTML = `
      <img src="${car.image}" alt="${car.model}">
      <h3>${car.model}</h3>
      <p class="price">${car.price}</p>
      <button>Add to Wishlist</button>
    `;
    container.appendChild(card);
  });
}
