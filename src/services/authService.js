import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ValidationError, UnauthorizedError } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || JWT_SECRET + '_refresh';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

console.log('JWT_SECRET', JWT_SECRET);
console.log('REFRESH_TOKEN_SECRET', REFRESH_TOKEN_SECRET);

class AuthService {
  /**
   * Generate JWT token
   */
  generateToken(user) {
    const payload = {
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      id: user._id.toString(),
      type: 'refresh',
    };

    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  /**
   * Register new user
   */
  async signup(userData) {
    const { email, password, firstName, lastName, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ValidationError('User with this email already exists', {
        email: 'Email is already registered',
      });
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save hook
      firstName: firstName || '',
      lastName: lastName || '',
      role: role || 'Member',
    });

    await user.save();

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Return user without password
    const userObj = user.toJSON();

    return {
      user: userObj,
      token,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Return user without password
    const userObj = user.toJSON();

    return {
      user: userObj,
      token,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('User not found or inactive');
      }

      const newToken = this.generateToken(user);

      return {
        token: newToken,
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }
      throw error;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }
    return user.toJSON();
  }
}

export default new AuthService();

