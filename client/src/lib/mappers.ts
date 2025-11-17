/**
 * Data mappers for transforming data between frontend and backend formats
 */

import { Task, TaskStatus, TaskPriority } from '../types';

/**
 * Status mapping between frontend and backend
 */
const STATUS_MAP_FRONTEND_TO_BACKEND: Record<TaskStatus, string> = {
  'Pending': 'pending',
  'In Progress': 'in-progress',
  'Completed': 'completed',
  'Cancelled': 'cancelled',
};

const STATUS_MAP_BACKEND_TO_FRONTEND: Record<string, TaskStatus> = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
};

/**
 * Priority mapping between frontend and backend
 */
const PRIORITY_MAP_FRONTEND_TO_BACKEND: Record<TaskPriority, string> = {
  'Low': 'low',
  'Medium': 'medium',
  'High': 'high',
  'Urgent': 'urgent',
};

const PRIORITY_MAP_BACKEND_TO_FRONTEND: Record<string, TaskPriority> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'urgent': 'Urgent',
};

/**
 * Convert frontend status to backend format
 */
export function statusToBackend(status: TaskStatus): string {
  return STATUS_MAP_FRONTEND_TO_BACKEND[status] || status.toLowerCase().replace(' ', '-');
}

/**
 * Convert backend status to frontend format
 */
export function statusFromBackend(status: string): TaskStatus {
  return STATUS_MAP_BACKEND_TO_FRONTEND[status] || (status?.charAt(0)?.toUpperCase() + status?.slice(1).replace('-', ' ')) as TaskStatus;
}

/**
 * Convert frontend priority to backend format
 */
export function priorityToBackend(priority: TaskPriority): string {
  return PRIORITY_MAP_FRONTEND_TO_BACKEND[priority] || priority.toLowerCase();
}

/**
 * Convert backend priority to frontend format
 */
export function priorityFromBackend(priority: string): TaskPriority {
  return PRIORITY_MAP_BACKEND_TO_FRONTEND[priority] || (priority?.charAt(0)?.toUpperCase() + priority?.slice(1)) as TaskPriority;
}

/**
 * Transform backend task to frontend Task format
 */
export function taskFromBackend(backendTask: any): Task {
  return {
    id: backendTask._id || backendTask.id,
    title: backendTask.title,
    description: backendTask.description || '',
    status: statusFromBackend(backendTask.status),
    priority: priorityFromBackend(backendTask.priority),
    dueDate: backendTask.dueDate 
      ? (typeof backendTask.dueDate === 'string' 
          ? backendTask.dueDate.split('T')[0] 
          : new Date(backendTask.dueDate).toISOString().split('T')[0])
      : undefined,
    assignedTo: backendTask.assignedTo || undefined,
    createdBy: backendTask.createdBy || '',
    createdAt: backendTask.createdAt || new Date().toISOString(),
    updatedAt: backendTask.updatedAt || new Date().toISOString(),
  };
}

/**
 * Transform frontend Task to backend format
 */
export function taskToBackend(task: Partial<Task>): any {
  const backendTask: any = {};

  if (task.title !== undefined) backendTask.title = task.title;
  if (task.description !== undefined) backendTask.description = task.description || '';
  if (task.status !== undefined) backendTask.status = statusToBackend(task.status as TaskStatus);
  if (task.priority !== undefined) backendTask.priority = priorityToBackend(task.priority as TaskPriority);
  if (task.dueDate !== undefined) {
    backendTask.dueDate = task.dueDate ? new Date(task.dueDate).toISOString() : null;
  }
  if (task.assignedTo !== undefined) backendTask.assignedTo = task.assignedTo || null;

  return backendTask;
}

/**
 * Transform multiple backend tasks to frontend format
 */
export function tasksFromBackend(backendTasks: any[]): Task[] {
  return backendTasks.map(taskFromBackend);
}

/**
 * Transform dashboard stats from backend format
 */
export function dashboardStatsFromBackend(backendStats: any): any {
  if (!backendStats || !backendStats.data) return null;

  const stats = backendStats.data || backendStats;

  return {
    totalTasks: stats.summary?.total || 0,
    completedTasks: stats.summary?.completionRate?.completed || 0,
    overdueTasks: stats.summary?.overdue?.count || 0,
    dueSoonTasks: stats.summary?.dueSoon?.count || 0,
    avgCompletionTime: stats.summary?.averageCompletionTime?.avgDays || 0,
    completionRate: stats.summary?.completionRate?.rate || 0,
    statusCounts: {
      'Pending': stats.summary?.byStatus?.pending || 0,
      'In Progress': stats.summary?.byStatus?.['in-progress'] || 0,
      'Completed': stats.summary?.byStatus?.completed || 0,
      'Cancelled': stats.summary?.byStatus?.cancelled || 0,
    },
    priorityCounts: {
      'Low': stats.summary?.byPriority?.low || 0,
      'Medium': stats.summary?.byPriority?.medium || 0,
      'High': stats.summary?.byPriority?.high || 0,
      'Urgent': stats.summary?.byPriority?.urgent || 0,
    },
    byAssignee: stats.byAssignee || {},
    overdueTasksList: stats.summary?.overdue?.tasks?.map((t: any) => taskFromBackend(t)) || [],
    dueSoonTasksList: stats.summary?.dueSoon?.tasks?.map((t: any) => taskFromBackend(t)) || [],
    recentTasks: stats.recentTasks?.map((t: any) => taskFromBackend(t)) || [],
    tasksCreatedOverTime: stats.tasksCreatedOverTime || [],
  };
}

