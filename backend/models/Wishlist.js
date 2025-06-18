const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  userId: String,
  cars: [Object]
});

module.exports = mongoose.model('Wishlist', WishlistSchema);
