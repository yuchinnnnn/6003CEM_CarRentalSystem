const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST /api/bookings — Create a booking
router.post('/', async (req, res) => {
  try {
    const { userId, car, startDate, endDate, totalPrice } = req.body;

    if (!userId || !car || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required booking details.' });
    }

    const { pickupLocation, dropoffLocation, pickupTime, dropoffTime } = car;

    if (!pickupLocation || !dropoffLocation || !pickupTime || !dropoffTime) {
      return res.status(400).json({ message: 'Missing pickup/drop-off details.' });
    }
    

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < now) {
      return res.status(400).json({ message: 'Start date cannot be in the past.' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'End date must be after start date.' });
    }

    // Step 3: Optional - limit maximum booking length
    const maxDuration = 30;
    const durationDays = (end - start) / (1000 * 60 * 60 * 24);
    if (durationDays > maxDuration) {
      return res.status(400).json({ message: `Booking cannot exceed ${maxDuration} days.` });
    }

    const hasActiveBooking = await Booking.findOne({
      user: userId,
      endDate: { $gte: new Date() }
    });

    if (hasActiveBooking) {
      return res.status(403).json({
        message: 'You already have an active booking. Cancel it before booking another car.'
      });
    }

    const overlappingBooking = await Booking.findOne({
      'car.id': car.id,
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });

    if (overlappingBooking) {
      if (overlappingBooking.user.toString() === userId) {
        return res.status(409).json({ message: 'You already booked this car for that period.' });
      }
      return res.status(409).json({ message: 'This car is already booked for the selected period.' });
    }

    const booking = new Booking({ 
      user: userId, 
      car, 
      startDate, 
      endDate,
      totalPrice,
      status: req.body.status || "pending"
    });
    await booking.save();

    res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Booking failed' });
  }
});


// PATCH /api/bookings/:bookingId — Update booking status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Missing status" });

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({ message: "Booking updated", booking });
  } catch (err) {
    console.error("Booking update error:", err);
    res.status(500).json({ message: "Failed to update booking" });
  }
});

// GET /api/bookings/:userId — Get bookings by user
router.get('/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

module.exports = router;