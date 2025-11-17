import express from 'express';
import validateRequest from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/auth.js';
import { signupSchema, loginSchema, refreshTokenSchema } from '../validators/authValidators.js';
import {
  signup,
  login,
  refreshToken,
  getCurrentUser,
  logout,
} from '../controllers/authController.js';

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/signup',
  validateRequest(signupSchema, 'body'),
  signup
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  validateRequest(loginSchema, 'body'),
  login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validateRequest(refreshTokenSchema, 'body'),
  refreshToken
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, logout);

export default router;

