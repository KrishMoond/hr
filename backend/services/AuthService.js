const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');

class AuthService {
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  async login(email, password, ipAddress, userAgent) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !await this.comparePassword(password, user.password)) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Update login info
    user.lastLogin = new Date();
    user.loginAttempts = 0;
    await user.save();

    const { accessToken, refreshToken } = this.generateTokens(user._id);

    // Store refresh token hash
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({
      token: refreshTokenHash,
      createdAt: new Date(),
      ipAddress,
      userAgent
    });

    // Keep only last 5 refresh tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    return {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const tokenExists = user.refreshTokens?.some(rt => rt.token === refreshTokenHash);

      if (!tokenExists) {
        throw new Error('Invalid refresh token');
      }

      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user._id);

      // Replace old refresh token with new one
      const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
      user.refreshTokens = user.refreshTokens.map(rt => 
        rt.token === refreshTokenHash 
          ? { ...rt, token: newRefreshTokenHash, createdAt: new Date() }
          : rt
      );

      await user.save();

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId, refreshToken) {
    const user = await User.findById(userId);
    if (user && refreshToken) {
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      user.refreshTokens = user.refreshTokens?.filter(rt => rt.token !== refreshTokenHash) || [];
      await user.save();
    }
  }
}

module.exports = new AuthService();