import express from 'express';
import { authenticate } from '../middleware/auth.js';
import validateProjectMembership from '../middleware/validateProjectMembership.js';
import validateRequest from '../middleware/validateRequest.js';
import authorizeTaskUpdate from '../middleware/taskAuthorization.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  listTasksQuerySchema,
} from '../validators/taskValidators.js';
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router({ mergeParams: true });

/**
 * All task routes require authentication and project membership validation
 */
router.use(authenticate);
router.use(validateProjectMembership);

/**
 * @route   POST /api/projects/:projectId/tasks
 * @desc    Create a new task
 * @access  Private (Project Admin only)
 */
router.post(
  '/',
  validateRequest(createTaskSchema, 'body'),
  createTask
);

/**
 * @route   GET /api/projects/:projectId/tasks
 * @desc    List tasks for a project with optional filtering
 * @access  Private (Project Members)
 */
router.get(
  '/',
  validateRequest(listTasksQuerySchema, 'query'),
  listTasks
);

/**
 * @route   GET /api/projects/:projectId/tasks/:taskId
 * @desc    Get task details
 * @access  Private (Project Members)
 */
router.get('/:taskId', getTask);

/**
 * @route   PUT /api/projects/:projectId/tasks/:taskId
 * @desc    Update task (admin: all fields, assigned user: status only)
 * @access  Private (Project Admin or Assigned User)
 */
router.put(
  '/:taskId',
  validateRequest(updateTaskSchema, 'body'),
  authorizeTaskUpdate,
  updateTask
);

/**
 * @route   DELETE /api/projects/:projectId/tasks/:taskId
 * @desc    Delete a task
 * @access  Private (Project Admin only)
 */
router.delete('/:taskId', deleteTask);

export default router;

