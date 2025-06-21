const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleWare');
const bcrypt = require('bcryptjs'); 
const multer = require('multer');


const path = require('path');
// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../upload')); // safer
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Route: POST /api/account/upload-profile
router.post('/upload-profile', upload.single('profileImage'), async (req, res) => {
  const { userId } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profileImage = `/upload/${req.file.filename}`;
    await user.save();

    res.json({ message: 'Profile picture updated', imageUrl: user.profileImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// @route   GET /api/user/:id
// @desc    Get user details (excluding password)
// @access  Public or Protected (up to you)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/:id', auth, async (req, res) => {
  const { username, email, profilePicture, currentPassword, newPassword } = req.body;

  try {
    // Find the user by ID
    let user = await User.findById(req.params.id);
    if (!user){ 
      return res.status(404).json({ msg: 'User not found' });
    }

     // Only allow user to update their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ msg: 'You can only update your own profile' });
    }

    // Update fields
    if (username) {user.username = username;}
    if (email) {user.email = email;}
    if (profilePicture) {user.profilePicture = profilePicture;}
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ msg: 'Current password is incorrect' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      console.log("Password updated");
    }

    await user.save();
    const { password: _, ...userData } = user._doc;
    res.json({ 
      msg: 'User updated successfully', 
      user: userData, 
      imageUrl: user.profileImage });
    console.log(`User ${user.username} updated successfully`);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});




module.exports = router;
