import React, { useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TaskStatus, TaskPriority } from '../types';
import { toast } from 'sonner';

export const TaskListPage: React.FC = () => {
  const { tasks, loading, error, projectId, fetchTasks } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get filters from URL or use defaults
  const statusFilter = (searchParams.get('status') as TaskStatus | 'All') || 'All';
  const priorityFilter = (searchParams.get('priority') as TaskPriority | 'All') || 'All';
  const assignedToFilter = searchParams.get('assignedTo') || '';
  const overdueOnly = searchParams.get('overdue') === 'true';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const itemsPerPage = 10;

  // Helper to update URL params
  const updateFilters = (updates: Record<string, string | number | boolean>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === 'All' || value === false || value === 1) {
        newParams.delete(key);
      } else {
        newParams.set(key, value.toString());
      }
    });
    
    setSearchParams(newParams);
  };

  useEffect(() => {
    if (projectId && tasks.length === 0 && !loading) {
      fetchTasks().catch(err => {
        console.error('Error fetching tasks:', err);
      });
    }
  }, [projectId]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (statusFilter !== 'All') {
      result = result.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'All') {
      result = result.filter(task => task.priority === priorityFilter);
    }

    if (assignedToFilter) {
      result = result.filter(task => task.assignedTo?.includes(assignedToFilter));
    }

    if (overdueOnly) {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(
        task => task.dueDate && task.dueDate < today && task.status !== 'Completed'
      );
    }

    return result;
  }, [tasks, statusFilter, priorityFilter, assignedToFilter, overdueOnly]);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!projectId) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
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

  if (loading && tasks.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#e5e7eb] p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div
          className="bg-[#fee2e2] border border-[#fecaca] rounded-xl p-6 text-center"
          style={{ color: '#991b1b' }}
        >
          <h2 className="mb-2">Error Loading Tasks</h2>
          <p>{error}</p>
          <button
            onClick={() => fetchTasks()}
            className="mt-4 px-4 py-2 bg-[#dc2626] text-white rounded-md hover:bg-[#b91c1c] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="mb-1">Tasks</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {filteredTasks.length} total
          </p>
        </div>
        <button
          onClick={() => navigate('/tasks/new')}
          className="px-4 py-[0.6rem] bg-[#111827] text-white rounded-md hover:bg-[#1f2937] transition-colors"
        >
          Create Task
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-lg border border-[#fecaca]"
          style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
        >
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-white rounded-xl border border-[#e5e7eb]">
        <select
          value={statusFilter}
          onChange={e => updateFilters({ 
            status: e.target.value, 
            page: 1 
          })}
          className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
        >
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={priorityFilter}
          onChange={e => updateFilters({ 
            priority: e.target.value, 
            page: 1 
          })}
          className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
        >
          <option value="All">All priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        <input
          type="text"
          placeholder="Filter assigned user ID"
          value={assignedToFilter}
          onChange={e => updateFilters({ 
            assignedTo: e.target.value, 
            page: 1 
          })}
          className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
        />

        <label className="flex items-center gap-2 px-3 py-2">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={e => updateFilters({ 
              overdue: e.target.checked, 
              page: 1 
            })}
            className="w-4 h-4"
          />
          <span>Overdue only</span>
        </label>
      </div>

      {/* Task List */}
      {paginatedTasks.length === 0 && !loading ? (
        <div
          className="p-12 text-center border-2 border-dashed border-[#d1d5db] rounded-xl"
          style={{ color: '#6b7280' }}
        >
          No tasks match the current filters.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {paginatedTasks.map(task => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-[#e5e7eb] p-6"
              style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="mb-2" style={{ fontSize: '1.05rem' }}>
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    {task.dueDate && (
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Due {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                      {task.description}
                    </p>
                  )}
                </div>
                <Link
                  to={`/tasks/${task.id}`}
                  className="px-4 py-2 border border-[#d1d5db] rounded-md hover:bg-gray-50 transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => updateFilters({ page: Math.max(1, currentPage - 1) })}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-[#d1d5db] rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span style={{ color: '#6b7280' }}>
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => updateFilters({ page: Math.min(totalPages, currentPage + 1) })}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-[#d1d5db] rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
