const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  car: {
    id: String,
    make: String,
    model: String,
    pickupLocation: String,
    dropoffLocation: String,
    pickupTime: String,
    dropoffTime: String,
    year: String,
    imageUrl: String,
    price: Number,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' } // pending, confirmed, cancelled

});

module.exports = mongoose.model('Booking', bookingSchema);
