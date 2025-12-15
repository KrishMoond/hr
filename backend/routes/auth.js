const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { auth } = require('../middleware/auth');
const { authLimiter, validateInput, validationRules } = require('../middleware/security');
const { securityLogger } = require('../middleware/logging');

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Register
router.post('/register', 
  validateInput([
    validationRules.email,
    validationRules.password,
    validationRules.name,
    validationRules.sanitizeString('position', 100),
    validationRules.sanitizeString('department', 100)
  ]),
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, position, department } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        email: email.toLowerCase() 
      }).select('_id');
      
      if (existingUser) {
        securityLogger.loginFailure(email, 'User already exists', req.ip, req.get('User-Agent'));
        return res.status(409).json({ 
          error: 'Registration failed',
          message: 'User with this email already exists' 
        });
      }

      // Create user with sanitized data
      const user = new User({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase(),
        password,
        position: position?.trim(),
        department: department?.trim()
      });

      await user.save();

      // Create employee record
      const employeeId = `EMP${Date.now()}`;
      const employee = new Employee({
        user: user._id,
        employeeId,
        joinDate: new Date(),
        salary: 50000
      });

      await employee.save();

      // Generate tokens
      const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRE }
      );

      securityLogger.loginAttempt(email, true, req.ip, req.get('User-Agent'));

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: 'Registration failed',
        message: 'Internal server error' 
      });
    }
  }
);

// Login
router.post('/login',
  validateInput([
    validationRules.email,
    validationRules.sanitizeString('password', 128)
  ]),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const clientIP = req.ip;
      const userAgent = req.get('User-Agent');

      // Find user by email
      const user = await User.findOne({ 
        email: email.toLowerCase() 
      }).select('+password +loginAttempts +lockUntil');

      if (!user) {
        securityLogger.loginFailure(email, 'User not found', clientIP, userAgent);
        return res.status(401).json({ 
          error: 'Authentication failed',
          message: 'Invalid email or password' 
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        securityLogger.loginFailure(email, 'Account locked', clientIP, userAgent);
        return res.status(423).json({ 
          error: 'Account locked',
          message: 'Account is temporarily locked due to too many failed attempts' 
        });
      }

      // Check if account is active
      if (!user.isActive) {
        securityLogger.loginFailure(email, 'Account disabled', clientIP, userAgent);
        return res.status(401).json({ 
          error: 'Account disabled',
          message: 'Your account has been deactivated' 
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Increment failed attempts
        await user.incLoginAttempts();
        securityLogger.loginFailure(email, 'Invalid password', clientIP, userAgent);
        return res.status(401).json({ 
          error: 'Authentication failed',
          message: 'Invalid email or password' 
        });
      }

      // Reset login attempts and update last login
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user._id, 
          role: user.role,
          iat: Math.floor(Date.now() / 1000)
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRE }
      );

      securityLogger.loginAttempt(email, true, clientIP, userAgent);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Authentication failed',
        message: 'Internal server error' 
      });
    }
  }
);

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -loginAttempts -lockUntil')
      .lean();
    
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName email')
      .lean();
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found' 
      });
    }

    res.json({
      success: true,
      user,
      employee
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user data',
      message: 'Internal server error' 
    });
  }
});

// Get all users for chat
router.get('/users', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    
    const query = {
      _id: { $ne: req.user._id },
      isActive: true
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('firstName lastName email role department isActive avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ firstName: 1 })
      .lean();
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: 'Internal server error' 
    });
  }
});

// Logout (invalidate token)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a production app, you'd maintain a blacklist of tokens
    // For now, we'll just log the logout event
    securityLogger.loginAttempt(req.user.email, false, req.ip, req.get('User-Agent'));
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      message: 'Internal server error' 
    });
  }
});

module.exports = router;