import { ForbiddenError } from '../utils/errors.js';
import taskService from '../services/taskService.js';

/**
 * Middleware to check if user can update a task
 * - Admins can update all fields
 * - Assigned users can only update status
 */
export const authorizeTaskUpdate = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'Admin';

    // If admin, allow all updates
    if (isAdmin) {
      return next();
    }

    // For non-admins, check if task is assigned to them
    const task = await taskService.getTaskById(taskId, projectId);

    if (task.assignedTo?.toString() !== userId) {
      throw new ForbiddenError('You can only update tasks assigned to you');
    }

    // Non-admins can only update status
    if (req.body && Object.keys(req.body).some((key) => key !== 'status')) {
      throw new ForbiddenError('You can only update the status of tasks assigned to you');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default authorizeTaskUpdate;

