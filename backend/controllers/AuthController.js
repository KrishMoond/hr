const AuthService = require('../services/AuthService');
const ApiResponse = require('../utils/ApiResponse');
const { validate, schemas } = require('../middleware/validation');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      const result = await AuthService.login(email, password, ipAddress, userAgent);

      res.json(ApiResponse.success(result, 'Login successful'));
    } catch (error) {
      res.status(401).json(
        ApiResponse.error(error.message, 'AUTH_FAILED', null, 401)
      );
    }
  }

  async register(req, res) {
    try {
      const userData = req.body;
      const hashedPassword = await AuthService.hashPassword(userData.password);

      const user = new User({
        ...userData,
        password: hashedPassword
      });

      await user.save();

      const { accessToken, refreshToken } = AuthService.generateTokens(user._id);

      res.status(201).json(ApiResponse.success({
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      }, 'Registration successful'));
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json(
          ApiResponse.error('Email already exists', 'EMAIL_EXISTS', null, 409)
        );
      }
      res.status(500).json(
        ApiResponse.error('Registration failed', 'REGISTRATION_FAILED', error.message, 500)
      );
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json(
          ApiResponse.error('Refresh token required', 'TOKEN_REQUIRED', null, 400)
        );
      }

      const tokens = await AuthService.refreshToken(refreshToken);
      res.json(ApiResponse.success(tokens, 'Token refreshed successfully'));
    } catch (error) {
      res.status(401).json(
        ApiResponse.error('Invalid refresh token', 'INVALID_TOKEN', null, 401)
      );
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(req.user.id, refreshToken);
      
      res.json(ApiResponse.success(null, 'Logout successful'));
    } catch (error) {
      res.status(500).json(
        ApiResponse.error('Logout failed', 'LOGOUT_FAILED', error.message, 500)
      );
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password -refreshTokens');
      res.json(ApiResponse.success(user, 'Profile retrieved successfully'));
    } catch (error) {
      res.status(500).json(
        ApiResponse.error('Failed to get profile', 'PROFILE_ERROR', error.message, 500)
      );
    }
  }
}

module.exports = new AuthController();