const express = require('express');
const AuthController = require('../controllers/AuthController');
const { validate, schemas } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', validate(schemas.auth.login), AuthController.login);
router.post('/register', validate(schemas.auth.register), AuthController.register);
router.post('/refresh-token', AuthController.refreshToken);

// Protected routes
router.use(auth); // Apply auth middleware to all routes below
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getProfile);

module.exports = router;