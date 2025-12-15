const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Enhanced rate limiting with different limits for different endpoints
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// General API rate limiting
const generalLimiter = createRateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  'Too many requests from this IP, please try again later'
);

// Strict rate limiting for authentication endpoints
const authLimiter = createRateLimit(
  900000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_LOGIN_ATTEMPTS) || 5,
  'Too many login attempts, please try again later'
);

// File upload rate limiting
const uploadLimiter = createRateLimit(
  3600000, // 1 hour
  10,
  'Too many file uploads, please try again later'
);

// Input validation middleware
const validateInput = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  };
};

// Common validation rules
const validationRules = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  password: body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
  
  name: body(['firstName', 'lastName'])
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must be 2-50 characters and contain only letters'),
  
  objectId: (field) => body(field)
    .isMongoId()
    .withMessage(`${field} must be a valid ID`),
  
  sanitizeString: (field, maxLength = 1000) => body(field)
    .trim()
    .escape()
    .isLength({ max: maxLength })
    .withMessage(`${field} must not exceed ${maxLength} characters`)
};

// Error sanitization middleware
const sanitizeError = (err, req, res, next) => {
  // Log full error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Send sanitized error to client
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  validateInput,
  validationRules,
  sanitizeError
};