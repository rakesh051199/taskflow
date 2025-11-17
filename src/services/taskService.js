import Task from '../models/Task.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import projectService from './projectService.js';

/**
 * Task Service - Business logic for task operations
 */
class TaskService {
  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @param {string} taskData.title - Task title
   * @param {string} taskData.description - Task description (optional)
   * @param {string} taskData.status - Task status (optional, defaults to 'pending')
   * @param {string} taskData.projectId - Project ID
   * @param {string} taskData.assignedTo - Assigned user ID (optional)
   * @param {string} taskData.createdBy - User ID who created the task
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData) {
    const { title, description, status, priority, dueDate, projectId, assignedTo, createdBy } = taskData;

    // Validate project exists
    await projectService.validateProjectExists(projectId);

    // Validate that the creator is a project member
    const creatorIsMember = await projectService.isProjectMember(projectId, createdBy);
    if (!creatorIsMember) {
      throw new ValidationError('You must be a member of the project to create tasks', {
        createdBy: 'User is not a member of this project',
      });
    }

    // Validate assigned user is a project member (if provided)
    // This also handles null/undefined to allow unassigned tasks
    await projectService.validateUserCanBeAssigned(projectId, assignedTo);

    const task = new Task({
      title,
      description: description || '',
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      projectId,
      assignedTo: assignedTo || null,
      createdBy,
    });

    return await task.save();
  }

  /**
   * Get task by ID
   * @param {string} taskId - Task ID
   * @param {string} projectId - Project ID (for validation)
   * @returns {Promise<Object>} Task
   */
  async getTaskById(taskId, projectId) {
    const task = await Task.findOne({ 
      _id: taskId, 
      projectId,
      deletedAt: null, // Exclude soft-deleted tasks
    });

    if (!task) {
      throw new NotFoundError('Task');
    }

    return task;
  }

  /**
   * List tasks for a project with pagination and filtering
   * @param {Object} options - Query options
   * @param {string} options.projectId - Project ID
   * @param {string} options.status - Filter by status (optional)
   * @param {string} options.assignedTo - Filter by assigned user (optional)
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 50)
   * @returns {Promise<Object>} Tasks and pagination info
   */
  async listTasks(options) {
    const { projectId, status, priority, assignedTo, overdue, page = 1, limit = 50 } = options;

    // Build query - always exclude soft-deleted tasks
    const query = { 
      projectId,
      deletedAt: null,
    };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Filter by overdue tasks (dueDate < now and status not completed)
    if (overdue === true) {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'completed' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 100); // Maximum 100 items per page

    // Execute query
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(maxLimit)
        .lean(),
      Task.countDocuments(query),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit: maxLimit,
        total,
        pages: Math.ceil(total / maxLimit),
      },
    };
  }

  /**
   * Update task
   * @param {string} taskId - Task ID
   * @param {string} projectId - Project ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(taskId, projectId, updateData) {
    const task = await this.getTaskById(taskId, projectId);

    // If assignedTo is being updated, validate user is a project member
    if (updateData.assignedTo !== undefined && updateData.assignedTo !== null) {
      await projectService.validateUserCanBeAssigned(projectId, updateData.assignedTo);
    }

    // Update allowed fields
    if (updateData.title !== undefined) task.title = updateData.title;
    if (updateData.description !== undefined) task.description = updateData.description;
    if (updateData.status !== undefined) task.status = updateData.status;
    if (updateData.priority !== undefined) task.priority = updateData.priority;
    if (updateData.dueDate !== undefined) task.dueDate = updateData.dueDate;
    if (updateData.assignedTo !== undefined) task.assignedTo = updateData.assignedTo;

    return await task.save();
  }

  /**
   * Delete task
   * @param {string} taskId - Task ID
   * @param {string} projectId - Project ID
   * @returns {Promise<void>}
   */
  async deleteTask(taskId, projectId) {
    const task = await this.getTaskById(taskId, projectId);
    
    // Soft delete: set deletedAt instead of removing document
    task.deletedAt = new Date();
    await task.save();
    
    return task;
  }
}

export default new TaskService();

