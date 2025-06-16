const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST /api/bookings — Create a booking
router.post('/', async (req, res) => {
  try {
    const { userId, carId, startDate, endDate } = req.body;

    const booking = new Booking({
      user: userId,
      car: carId,
      startDate,
      endDate
    });

    await booking.save();
    res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Booking failed' });
  }
});

module.exports = router;
