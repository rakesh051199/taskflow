import dashboardService from '../services/dashboardService.js';
import { sendSuccess } from '../utils/responseFormatter.js';

/**
 * Get comprehensive dashboard statistics
 * GET /api/projects/:projectId/dashboard
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const stats = await dashboardService.getDashboardStats(projectId);
    return sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Get task status over time
 * GET /api/projects/:projectId/dashboard/status-over-time
 */
export const getStatusOverTime = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { dateRange = '30days' } = req.query;
    const data = await dashboardService.getStatusOverTime(projectId, dateRange);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

