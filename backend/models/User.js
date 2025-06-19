const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  profileImage: {
    type: String,
    default: '../assets/default-profile-pic.jpg' // Default image URL
  },
});

module.exports = mongoose.model('User', UserSchema);
