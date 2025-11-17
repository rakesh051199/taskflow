import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../lib/apiClient';
import { dashboardStatsFromBackend } from '../lib/mappers';
import { toast } from 'sonner';

export const DashboardPage: React.FC = () => {
  const { tasks, projectId, loading: contextLoading } = useApp();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!projectId) {
        setError('Project ID is required');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await api.getDashboardStats(projectId);
        const stats = dashboardStatsFromBackend(response);
        setDashboardStats(stats);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchDashboard();
    }
  }, [projectId]);

  // Use API stats if available, otherwise fallback to client-side calculation
  const stats = useMemo(() => {
    if (dashboardStats) {
      return {
        total: dashboardStats.totalTasks || 0,
        completed: dashboardStats.completedTasks || 0,
        overdue: dashboardStats.overdueTasks || 0,
        dueSoon: dashboardStats.dueSoonTasks || 0,
        avgCompletionTime: dashboardStats.avgCompletionTime || 0,
        completionRate: dashboardStats.completionRate || 0,
      };
    }

    // Fallback calculation from tasks
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const today = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter(
      t => t.dueDate && t.dueDate < today && t.status !== 'Completed'
    ).length;
    const dueSoon = tasks.filter(t => {
      if (!t.dueDate || t.status === 'Completed') return false;
      const dueDate = new Date(t.dueDate);
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      return dueDate >= new Date() && dueDate <= sevenDaysFromNow;
    }).length;

    const completedTasks = tasks.filter(t => t.status === 'Completed');
    const avgCompletionTime =
      completedTasks.length > 0
        ? completedTasks.reduce((sum, task) => {
            const created = new Date(task.createdAt).getTime();
            const updated = new Date(task.updatedAt).getTime();
            return sum + (updated - created) / (1000 * 60 * 60 * 24);
          }, 0) / completedTasks.length
        : 0;

    return { total, completed, overdue, dueSoon, avgCompletionTime, completionRate: total > 0 ? (completed / total) * 100 : 0 };
  }, [dashboardStats, tasks]);

  const statusCounts = useMemo(() => {
    if (dashboardStats?.statusCounts) {
      return dashboardStats.statusCounts;
    }
    return {
      Pending: tasks.filter(t => t.status === 'Pending').length,
      'In Progress': tasks.filter(t => t.status === 'In Progress').length,
      Completed: tasks.filter(t => t.status === 'Completed').length,
      Cancelled: tasks.filter(t => t.status === 'Cancelled').length,
    };
  }, [dashboardStats, tasks]);

  const priorityCounts = useMemo(() => {
    if (dashboardStats?.priorityCounts) {
      return dashboardStats.priorityCounts;
    }
    return {
      Low: tasks.filter(t => t.priority === 'Low').length,
      Medium: tasks.filter(t => t.priority === 'Medium').length,
      High: tasks.filter(t => t.priority === 'High').length,
      Urgent: tasks.filter(t => t.priority === 'Urgent').length,
    };
  }, [dashboardStats, tasks]);

  const overdueTasks = useMemo(() => {
    if (dashboardStats?.overdueTasksList) {
      return dashboardStats.overdueTasksList.slice(0, 5);
    }
    const today = new Date().toISOString().split('T')[0];
    return tasks
      .filter(t => t.dueDate && t.dueDate < today && t.status !== 'Completed')
      .slice(0, 5);
  }, [dashboardStats, tasks]);

  const dueSoonTasks = useMemo(() => {
    if (dashboardStats?.dueSoonTasksList) {
      return dashboardStats.dueSoonTasksList.slice(0, 5);
    }
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return tasks
      .filter(t => {
        if (!t.dueDate || t.status === 'Completed') return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= new Date() && dueDate <= sevenDaysFromNow;
      })
      .slice(0, 5);
  }, [dashboardStats, tasks]);

  const recentTasks = useMemo(() => {
    if (dashboardStats?.recentTasks) {
      return dashboardStats.recentTasks.slice(0, 5);
    }
    return [...tasks].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5);
  }, [dashboardStats, tasks]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!projectId) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 text-center">
          <h2 className="mb-4">Project ID Required</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Please configure your Project ID in{' '}
            <Link to="/settings" className="text-[#111827] hover:underline">
              Settings
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (loading && !dashboardStats) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="mb-1">Dashboard</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Project analytics and insights
          </p>
        </div>
        <Link
          to="/tasks"
          className="px-4 py-[0.6rem] bg-[#111827] text-white rounded-md hover:bg-[#1f2937] transition-colors"
        >
          View All Tasks
        </Link>
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-lg border border-[#fecaca]"
          style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
        >
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            TOTAL TASKS
          </p>
          <p style={{ fontSize: '2rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            {stats.total}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {stats.completed} completed
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            COMPLETION RATE
          </p>
          <p style={{ fontSize: '2rem', color: '#10b981', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            {stats.completionRate.toFixed(1)}%
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {stats.completed} of {stats.total} tasks
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            OVERDUE TASKS
          </p>
          <p style={{ fontSize: '2rem', color: stats.overdue > 0 ? '#dc2626' : '#10b981', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            {stats.overdue}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {stats.overdue > 0 ? 'Requires attention' : 'All on track'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            DUE SOON
          </p>
          <p style={{ fontSize: '2rem', color: '#f59e0b', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            {stats.dueSoon}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Next 7 days</p>
        </div>

        {stats.avgCompletionTime > 0 && (
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AVG COMPLETION
            </p>
            <p style={{ fontSize: '2rem', color: '#3b82f6', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
              {stats.avgCompletionTime.toFixed(1)} days
            </p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Based on {stats.completed} tasks
            </p>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tasks by Status */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
          <h3 className="mb-4">Tasks by Status</h3>
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = stats.total > 0 ? ((count as number) / stats.total) * 100 : 0;
              const colors: Record<string, string> = {
                Pending: '#f59e0b',
                'In Progress': '#3b82f6',
                Completed: '#10b981',
                Cancelled: '#ef4444',
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[status] }}
                      />
                      <span>{status}</span>
                    </div>
                    <span>{count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[status],
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
          <h3 className="mb-4">Tasks by Priority</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(priorityCounts).map(([priority, count]) => {
              const percentage = stats.total > 0 ? ((count as number) / stats.total) * 100 : 0;
              const colors: Record<string, string> = {
                Low: '#86efac',
                Medium: '#fcd34d',
                High: '#fb923c',
                Urgent: '#f87171',
              };
              return (
                <div key={priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>{priority}</span>
                    <span>{count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[priority],
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assignee Stats */}
      {dashboardStats?.byAssignee && (
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 mb-8" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
          <h3 className="mb-4">Tasks by Assignee</h3>
          <div className="space-y-2">
            {dashboardStats.byAssignee.unassigned > 0 && (
              <div className="flex items-center justify-between">
                <span>Unassigned</span>
                <span style={{ color: '#6b7280' }}>{dashboardStats.byAssignee.unassigned}</span>
              </div>
            )}
            {dashboardStats.byAssignee.assigned?.map((item: any) => (
              <div key={item.assigneeId} className="flex items-center justify-between">
                <span>User {item.assigneeId?.slice(-6) || 'Unknown'}</span>
                <span style={{ color: '#6b7280' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
            <h3 className="mb-4" style={{ color: '#dc2626' }}>
              Overdue Tasks
            </h3>
            <div className="space-y-3">
              {overdueTasks.map(task => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="block p-3 border border-[#e5e7eb] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="mb-1">{task.title}</p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={task.status} />
                    {task.dueDate && (
                      <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>
                        Due {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Due Soon */}
        {dueSoonTasks.length > 0 && (
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
            <h3 className="mb-4" style={{ color: '#f59e0b' }}>
              Due Soon
            </h3>
            <div className="space-y-3">
              {dueSoonTasks.map(task => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="block p-3 border border-[#e5e7eb] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="mb-1">{task.title}</p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={task.status} />
                    {task.dueDate && (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Due {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Tasks */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
          <h3 className="mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="block p-3 border border-[#e5e7eb] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="mb-1">{task.title}</p>
                  <StatusBadge status={task.status} />
                </Link>
              ))
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>No recent tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
