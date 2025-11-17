import Task from '../models/Task.js';
import { NotFoundError } from '../utils/errors.js';
import projectService from './projectService.js';

/**
 * Dashboard Service - MongoDB Aggregation operations for dashboard analytics
 */
class DashboardService {
  /**
   * Get comprehensive dashboard statistics for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats(projectId) {
    // Validate project exists
    await projectService.validateProjectExists(projectId);

    // Base match condition - exclude soft-deleted tasks
    const baseMatch = {
      projectId: projectId,
      deletedAt: null,
    };

    // Execute all aggregations in parallel for better performance
    const [
      taskCountsByStatus,
      taskCountsByPriority,
      taskCountsByAssignee,
      overdueTasks,
      tasksDueSoon,
      completionRate,
      tasksCreatedOverTime,
      averageCompletionTime,
      recentTasks,
    ] = await Promise.all([
      this.getTaskCountsByStatus(projectId, baseMatch),
      this.getTaskCountsByPriority(projectId, baseMatch),
      this.getTaskCountsByAssignee(projectId, baseMatch),
      this.getOverdueTasksCount(projectId, baseMatch),
      this.getTasksDueSoonCount(projectId, baseMatch),
      this.getCompletionRate(projectId, baseMatch),
      this.getTasksCreatedOverTime(projectId, baseMatch, '30days'),
      this.getAverageCompletionTime(projectId, baseMatch),
      this.getRecentTasks(projectId, baseMatch),
    ]);

    return {
      summary: {
        total: taskCountsByStatus.total,
        byStatus: taskCountsByStatus.byStatus,
        byPriority: taskCountsByPriority,
        overdue: overdueTasks,
        dueSoon: tasksDueSoon,
        completionRate,
        averageCompletionTime,
      },
      byAssignee: taskCountsByAssignee,
      tasksCreatedOverTime,
      recentTasks,
    };
  }

  /**
   * Get task counts grouped by status
   * Uses MongoDB aggregation pipeline
   */
  async getTaskCountsByStatus(projectId, baseMatch) {
    const pipeline = [
      { $match: baseMatch },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ];

    const results = await Task.aggregate(pipeline);

    // Get total count
    const total = await Task.countDocuments(baseMatch);

    // Format results with all statuses (including zero counts)
    const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    const byStatus = statuses.reduce((acc, status) => {
      const found = results.find((r) => r.status === status);
      acc[status] = found ? found.count : 0;
      return acc;
    }, {});

    return { total, byStatus };
  }

  /**
   * Get task counts grouped by priority
   * Uses MongoDB aggregation pipeline
   */
  async getTaskCountsByPriority(projectId, baseMatch) {
    const pipeline = [
      { $match: baseMatch },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          priority: '$_id',
          count: 1,
        },
      },
    ];

    const results = await Task.aggregate(pipeline);

    // Format results with all priorities (including zero counts)
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const byPriority = priorities.reduce((acc, priority) => {
      const found = results.find((r) => r.priority === priority);
      acc[priority] = found ? found.count : 0;
      return acc;
    }, {});

    return byPriority;
  }

  /**
   * Get task counts grouped by assignee
   * Uses MongoDB aggregation pipeline with lookup for user details (if available)
   */
  async getTaskCountsByAssignee(projectId, baseMatch) {
    const pipeline = [
      { $match: baseMatch },
      {
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 },
          tasks: {
            $push: {
              id: '$_id',
              title: '$title',
              status: '$status',
              priority: '$priority',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          assigneeId: '$_id',
          count: 1,
          tasks: 1,
        },
      },
      { $sort: { count: -1 } },
    ];

    const results = await Task.aggregate(pipeline);

    // Separate unassigned tasks
    const unassigned = results.find((r) => r.assigneeId === null);
    const assigned = results.filter((r) => r.assigneeId !== null);

    return {
      unassigned: unassigned ? unassigned.count : 0,
      unassignedTasks: unassigned ? unassigned.tasks : [],
      assigned: assigned.map((item) => ({
        assigneeId: item.assigneeId,
        count: item.count,
        tasks: item.tasks,
      })),
    };
  }

  /**
   * Get count of overdue tasks (dueDate < now and status not completed)
   * Uses MongoDB aggregation pipeline
   */
  async getOverdueTasksCount(projectId, baseMatch) {
    const now = new Date();
    const matchCondition = {
      ...baseMatch,
      dueDate: { $lt: now, $ne: null },
      status: { $ne: 'completed' },
    };

    const pipeline = [
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          tasks: {
            $push: {
              id: '$_id',
              title: '$title',
              dueDate: '$dueDate',
              status: '$status',
              priority: '$priority',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          tasks: 1,
        },
      },
    ];

    const results = await Task.aggregate(pipeline);
    const result = results[0] || { count: 0, tasks: [] };

    return {
      count: result.count,
      tasks: result.tasks,
    };
  }

  /**
   * Get count of tasks due soon (within next 7 days)
   * Uses MongoDB aggregation pipeline
   */
  async getTasksDueSoonCount(projectId, baseMatch) {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const matchCondition = {
      ...baseMatch,
      dueDate: {
        $gte: now,
        $lte: sevenDaysFromNow,
        $ne: null,
      },
      status: { $ne: 'completed' },
    };

    const pipeline = [
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          tasks: {
            $push: {
              id: '$_id',
              title: '$title',
              dueDate: '$dueDate',
              status: '$status',
              priority: '$priority',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          tasks: 1,
        },
      },
    ];

    const results = await Task.aggregate(pipeline);
    const result = results[0] || { count: 0, tasks: [] };

    return {
      count: result.count,
      tasks: result.tasks,
    };
  }

  /**
   * Calculate completion rate (completed / total)
   * Uses MongoDB aggregation pipeline
   */
  async getCompletionRate(projectId, baseMatch) {
    const pipeline = [
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          completed: 1,
          rate: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: ['$completed', '$total'],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
    ];

    const results = await Task.aggregate(pipeline);
    const result = results[0] || { total: 0, completed: 0, rate: 0 };

    return {
      total: result.total,
      completed: result.completed,
      rate: Math.round(result.rate * 100) / 100, // Round to 2 decimal places
    };
  }

  /**
   * Get tasks created over time (time series data)
   * Groups by day/week/month based on dateRange parameter
   * Uses MongoDB aggregation pipeline
   */
  async getTasksCreatedOverTime(projectId, baseMatch, dateRange = '30days') {
    let groupFormat;
    let startDate;

    const now = new Date();
    switch (dateRange) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
        break;
      case '12months':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        };
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
    }

    const matchCondition = {
      ...baseMatch,
      createdAt: { $gte: startDate },
    };

    const pipeline = [
      { $match: matchCondition },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
          date: { $first: '$createdAt' },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: dateRange === '12months' ? '%Y-%m' : '%Y-%m-%d',
              date: '$date',
            },
          },
          count: 1,
        },
      },
      { $sort: { date: 1 } },
    ];

    const results = await Task.aggregate(pipeline);
    return results;
  }

  /**
   * Calculate average completion time for completed tasks
   * Uses MongoDB aggregation pipeline
   */
  async getAverageCompletionTime(projectId, baseMatch) {
    const pipeline = [
      {
        $match: {
          ...baseMatch,
          status: 'completed',
          createdAt: { $ne: null },
          updatedAt: { $ne: null },
        },
      },
      {
        $project: {
          completionTime: {
            $subtract: ['$updatedAt', '$createdAt'],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgCompletionTime: { $avg: '$completionTime' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          avgCompletionTime: 1,
          count: 1,
          avgDays: {
            $divide: ['$avgCompletionTime', 1000 * 60 * 60 * 24],
          },
        },
      },
    ];

    const results = await Task.aggregate(pipeline);
    const result = results[0] || { avgCompletionTime: 0, count: 0, avgDays: 0 };

    return {
      avgMilliseconds: result.avgCompletionTime || 0,
      avgDays: Math.round((result.avgDays || 0) * 100) / 100,
      count: result.count || 0,
    };
  }

  /**
   * Get recent tasks (last 10)
   * Uses MongoDB aggregation pipeline
   */
  async getRecentTasks(projectId, baseMatch) {
    const pipeline = [
      { $match: baseMatch },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          title: 1,
          status: 1,
          priority: 1,
          assignedTo: 1,
          createdAt: 1,
          dueDate: 1,
        },
      },
    ];

    const results = await Task.aggregate(pipeline);
    return results;
  }

  /**
   * Get task statistics by status over time
   * Uses MongoDB aggregation pipeline with date grouping
   */
  async getStatusOverTime(projectId, dateRange = '30days') {
    await projectService.validateProjectExists(projectId);

    let startDate;
    const now = new Date();
    switch (dateRange) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '12months':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const baseMatch = {
      projectId: projectId,
      deletedAt: null,
      createdAt: { $gte: startDate },
    };

    const pipeline = [
      { $match: baseMatch },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: dateRange === '12months' ? '%Y-%m' : '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          statuses: 1,
        },
      },
      { $sort: { date: 1 } },
    ];

    const results = await Task.aggregate(pipeline);
    return results;
  }
}

export default new DashboardService();

