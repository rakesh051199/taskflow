import express from 'express';
import { authenticate } from '../middleware/auth.js';
import validateProjectMembership from '../middleware/validateProjectMembership.js';
import {
  getDashboardStats,
  getStatusOverTime,
} from '../controllers/dashboardController.js';

const router = express.Router({ mergeParams: true });

/**
 * All dashboard routes require authentication and project membership validation
 */
router.use(authenticate);
router.use(validateProjectMembership);

/**
 * @route   GET /api/projects/:projectId/dashboard
 * @desc    Get comprehensive dashboard statistics
 * @access  Private (Project Members)
 */
router.get('/', getDashboardStats);

/**
 * @route   GET /api/projects/:projectId/dashboard/status-over-time
 * @desc    Get task status statistics over time
 * @access  Private (Project Members)
 */
router.get('/status-over-time', getStatusOverTime);

export default router;

