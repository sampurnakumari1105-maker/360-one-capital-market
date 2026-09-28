const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

function formatUserResponse(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    mobile: user.mobile || '',
    address: user.address || '',
    accountStatus: user.accountStatus || 'Active',
    createdAt: user.createdAt,
    accountSettings: user.accountSettings || {}
  };
}

router.use(authMiddleware);

// @route   GET /api/user/profile (also works for /api/user/me)
// @desc    Get currently logged-in user profile from MongoDB
router.get(['/profile', '/me'], async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in database.' });
    }
    return res.json({
      success: true,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
  }
});

// @route   PUT /api/user/profile
// @desc    Update profile fields (fullName, email, mobile, address) in MongoDB
router.put('/profile', async (req, res) => {
  try {
    const { fullName, email, mobile, address } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ success: false, message: 'Full name and email are required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail !== user.email) {
      const emailExists = await User.findOne({ email: cleanEmail });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email address is already in use by another account.' });
      }
    }

    user.fullName = fullName.trim();
    user.email = cleanEmail;
    if (mobile !== undefined) user.mobile = mobile.trim();
    if (address !== undefined) user.address = address.trim();

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully in MongoDB!',
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

// @route   GET /api/user/settings
// @desc    Get user settings from MongoDB
router.get('/settings', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('accountSettings');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({
      success: true,
      settings: user.accountSettings || {}
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching settings.' });
  }
});

// @route   PUT /api/user/settings
// @desc    Save/update user settings in MongoDB
router.put('/settings', async (req, res) => {
  try {
    const newSettings = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.accountSettings = {
      ...user.accountSettings.toObject(),
      ...newSettings
    };

    await user.save();

    return res.json({
      success: true,
      message: 'Settings saved successfully to MongoDB!',
      settings: user.accountSettings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ success: false, message: 'Server error saving settings.' });
  }
});

module.exports = router;
