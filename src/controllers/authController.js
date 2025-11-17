import authService from '../services/authService.js';
import { sendSuccess } from '../utils/responseFormatter.js';

/**
 * Register new user
 * POST /api/auth/signup
 */
export const signup = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const result = await authService.signup({
      email,
      password,
      firstName,
      lastName,
      role,
    });

    return sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await authService.getCurrentUser(userId);

    return sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout (client-side token removal, but can add token blacklisting here)
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    // In a more advanced setup, you could blacklist the token here
    // For now, just return success (client removes token)
    return sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

