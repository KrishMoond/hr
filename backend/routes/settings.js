const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user settings
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone, position, department, location, bio } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (position) user.position = position;
    if (department) user.department = department;
    if (location) user.location = location;
    if (bio) user.bio = bio;

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update password
router.put('/password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification preferences
router.put('/notifications', auth, async (req, res) => {
  try {
    const { email, push, sms, desktop } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof email === 'boolean') user.preferences.notifications.email = email;
    if (typeof push === 'boolean') user.preferences.notifications.push = push;
    if (typeof sms === 'boolean') user.preferences.notifications.sms = sms;
    if (typeof desktop === 'boolean') user.preferences.notifications.desktop = desktop;

    await user.save();

    res.json(user.preferences.notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appearance settings
router.put('/appearance', auth, async (req, res) => {
  try {
    const { theme, language, timezone, dateFormat, currency } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (theme) user.preferences.theme = theme;
    if (language) user.preferences.language = language;
    if (timezone) user.preferences.timezone = timezone;
    if (dateFormat) user.preferences.dateFormat = dateFormat;
    if (currency) user.preferences.currency = currency;

    await user.save();

    res.json(user.preferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system settings (admin only)
router.get('/system', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mock system settings - in production, these would be stored in database
    const systemSettings = {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 365,
      auditLogs: true,
      apiAccess: false,
      maintenanceMode: false,
      maxFileSize: 5242880, // 5MB
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      sessionTimeout: 30,
      passwordPolicy: {
        minLength: 6,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: false
      }
    };

    res.json(systemSettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update system settings (admin only)
router.put('/system', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const settings = req.body;
    
    // In production, save to database
    // For now, just return the updated settings
    res.json({ 
      message: 'System settings updated successfully',
      settings 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;