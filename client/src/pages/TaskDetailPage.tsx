import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TaskStatus, Task } from '../types';
import { api } from '../lib/apiClient';
import { taskFromBackend } from '../lib/mappers';
import { toast } from 'sonner';

export const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getTask, updateTask, deleteTask, auth, projectId } = useApp();
  const navigate = useNavigate();
  const [task, setTask] = useState(id ? getTask(id) : undefined as Task | undefined);
  const [loading, setLoading] = useState(!task);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id || !projectId) {
        setLoading(false);
        return;
      }

      // Try to get from context first
      const contextTask = getTask(id);
      if (contextTask) {
        setTask(contextTask);
        setLoading(false);
        return;
      }

      // If not in context, fetch from API
      try {
        setLoading(true);
        const response = await api.getTask(projectId, id);
        const backendTask = response.data || response;
        const frontendTask = taskFromBackend(backendTask);
        setTask(frontendTask);
      } catch (err) {
        console.error('Error fetching task:', err);
        toast.error(err instanceof Error ? err.message : 'Failed to load task');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, projectId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 text-center">
          <h2 className="mb-4">Task not found</h2>
          <Link to="/tasks" className="text-[#111827] hover:underline">
            Back to tasks
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!id) return;
    try {
      await updateTask(id, { status: newStatus });
      toast.success('Task updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const canEdit = auth.user?.id === task.createdBy || auth.user?.id === task.assignedTo;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="mb-2">{task.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <Link
              to={`/tasks/${id}/edit`}
              className="px-4 py-2 border border-[#d1d5db] rounded-md hover:bg-gray-50 transition-colors"
            >
              Edit
            </Link>
          )}
          {auth.user?.id === task.createdBy && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-[#dc2626] text-[#dc2626] rounded-md hover:bg-[#fee2e2] transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mb-6 p-4 bg-[#fee2e2] border border-[#fecaca] rounded-lg">
          <p className="mb-3" style={{ color: '#991b1b' }}>
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-[#dc2626] text-white rounded-md hover:bg-[#b91c1c] transition-colors"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 border border-[#d1d5db] rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task Information Card */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-8" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
        {/* Status Section */}
        <div className="mb-6 pb-6 border-b border-[#e5e7eb]">
          <label className="block mb-2">Status</label>
          {canEdit ? (
            <select
              value={task.status}
              onChange={e => handleStatusChange(e.target.value as TaskStatus)}
              className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          ) : (
            <StatusBadge status={task.status} />
          )}
        </div>

        {/* Task Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2" style={{ color: '#6b7280' }}>
              Priority
            </label>
            <PriorityBadge priority={task.priority} />
          </div>

          <div>
            <label className="block mb-2" style={{ color: '#6b7280' }}>
              Assigned To
            </label>
            <p>{task.assignedTo || 'Unassigned'}</p>
          </div>

          <div>
            <label className="block mb-2" style={{ color: '#6b7280' }}>
              Created By
            </label>
            <p>{task.createdBy}</p>
          </div>

          <div>
            <label className="block mb-2" style={{ color: '#6b7280' }}>
              Due Date
            </label>
            <p>{task.dueDate ? formatDateOnly(task.dueDate) : 'No due date'}</p>
          </div>

          <div>
            <label className="block mb-2" style={{ color: '#6b7280' }}>
              Created At
            </label>
            <p style={{ fontSize: '0.875rem' }}>{formatDate(task.createdAt)}</p>
          </div>

          <div>
            <label className="block mb-2" style={{ color: '#6b7280' }}>
              Last Updated
            </label>
            <p style={{ fontSize: '0.875rem' }}>{formatDate(task.updatedAt)}</p>
          </div>
        </div>

        {/* Description Section */}
        <div className="pt-6 border-t border-[#e5e7eb]">
          <label className="block mb-2" style={{ color: '#6b7280' }}>
            Description
          </label>
          {task.description ? (
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{task.description}</p>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No description</p>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <Link
          to="/tasks"
          className="text-[#6b7280] hover:text-[#111827] transition-colors"
        >
          ← Back to tasks
        </Link>
      </div>
    </div>
  );
};
