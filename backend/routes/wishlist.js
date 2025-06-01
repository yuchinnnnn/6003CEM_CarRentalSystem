const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const auth = require('../middleware/authMiddleWare');

// Get Wishlist
router.get('/', auth, async (req, res) => {
  const wishlist = await Wishlist.findOne({ userId: req.user.id });
  res.json(wishlist || { cars: [] });
});

// Add Car
router.post('/add', auth, async (req, res) => {
  const { car } = req.body;
  let wishlist = await Wishlist.findOne({ userId: req.user.id });
  if (!wishlist) wishlist = new Wishlist({ userId: req.user.id, cars: [] });

  wishlist.cars.push(car);
  await wishlist.save();
  res.json(wishlist);
});

// Remove Car
router.post('/remove', auth, async (req, res) => {
  const { carId } = req.body;
  const wishlist = await Wishlist.findOne({ userId: req.user.id });
  wishlist.cars = wishlist.cars.filter(c => c.id !== carId);
  await wishlist.save();
  res.json(wishlist);
});

module.exports = router;
