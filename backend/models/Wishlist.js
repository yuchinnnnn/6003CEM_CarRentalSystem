const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  userId: String,
  cars: [Object] // Store car info directly or use refs
});

module.exports = mongoose.model('Wishlist', WishlistSchema);
