import taskService from '../services/taskService.js';
import activityLogService from '../services/activityLogService.js';
import { sendSuccess, sendPaginated } from '../utils/responseFormatter.js';
import { parsePagination } from '../utils/pagination.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

/**
 * Create a new task
 * POST /api/projects/:projectId/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    // Create task
    const task = await taskService.createTask({
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assignedTo,
      createdBy: userId,
    });

    // Log activity asynchronously (don't await)
    activityLogService
      .logTaskCreation({
        userId,
        projectId,
        taskId: task._id.toString(),
        metadata: {
          title: task.title,
          status: task.status,
          assignedTo: task.assignedTo?.toString(),
        },
      })
      .catch((err) => console.error('Activity log error:', err));

    return sendSuccess(res, task, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * List tasks for a project
 * GET /api/projects/:projectId/tasks
 */
export const listTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignedTo, overdue } = req.query;
    const { page, limit } = parsePagination(req.query);

    const result = await taskService.listTasks({
      projectId,
      status,
      priority,
      assignedTo,
      overdue: overdue === 'true' || overdue === true,
      page,
      limit,
    });

    return sendPaginated(res, result.tasks, result.pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get task details
 * GET /api/projects/:projectId/tasks/:taskId
 */
export const getTask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;

    const task = await taskService.getTaskById(taskId, projectId);

    return sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
};

/**
 * Update task
 * PUT /api/projects/:projectId/tasks/:taskId
 */
export const updateTask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Get existing task to check permissions
    const existingTask = await taskService.getTaskById(taskId, projectId);

    // Check if user is admin or assigned user (for status updates only)
    const isAdmin = req.user.role === 'Admin';
    const isAssignedUser = existingTask.assignedTo?.toString() === userId;

    // Only admins can update all fields, assigned users can only update status
    if (!isAdmin) {
      if (!isAssignedUser) {
        throw new ForbiddenError('You do not have permission to update this task');
      }
      // If not admin, only allow status updates
      if (Object.keys(updateData).some((key) => key !== 'status')) {
        throw new ForbiddenError('You can only update the status of tasks assigned to you');
      }
    }

    const task = await taskService.updateTask(taskId, projectId, updateData);

    // Log activity asynchronously
    activityLogService
      .logTaskUpdate({
        userId,
        projectId,
        taskId: task._id.toString(),
        metadata: {
          updatedFields: Object.keys(updateData),
          previousStatus: existingTask.status,
          newStatus: task.status,
        },
      })
      .catch((err) => console.error('Activity log error:', err));

    return sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete task
 * DELETE /api/projects/:projectId/tasks/:taskId
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.id;

    // Only admins can delete tasks
    if (req.user.role !== 'Admin') {
      throw new ForbiddenError('Only project administrators can delete tasks');
    }

    const task = await taskService.deleteTask(taskId, projectId);

    // Log activity asynchronously
    activityLogService
      .logTaskDeletion({
        userId,
        projectId,
        taskId: task._id.toString(),
        metadata: {
          title: task.title,
        },
      })
      .catch((err) => console.error('Activity log error:', err));

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

