import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TaskStatus, TaskPriority } from '../types';
import { api } from '../lib/apiClient';
import { taskFromBackend } from '../lib/mappers';
import { toast } from 'sonner';

export const TaskFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getTask, addTask, updateTask, projectId } = useApp();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  const contextTask = isEdit && id ? getTask(id) : undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit && !contextTask);

  useEffect(() => {
    // If editing and task not in context, fetch from API
    const fetchTask = async () => {
      if (isEdit && id && !contextTask && projectId) {
        try {
          setFetching(true);
          const response = await api.getTask(projectId, id);
          const backendTask = response.data || response;
          const task = taskFromBackend(backendTask);
          
          setTitle(task.title);
          setDescription(task.description || '');
          setStatus(task.status);
          setPriority(task.priority);
          setDueDate(task.dueDate || '');
          setAssignedTo(task.assignedTo || '');
        } catch (err) {
          console.error('Error fetching task:', err);
          toast.error(err instanceof Error ? err.message : 'Failed to load task');
          navigate('/tasks');
        } finally {
          setFetching(false);
        }
      }
    };

    if (contextTask) {
      setTitle(contextTask.title);
      setDescription(contextTask.description || '');
      setStatus(contextTask.status);
      setPriority(contextTask.priority);
      setDueDate(contextTask.dueDate || '');
      setAssignedTo(contextTask.assignedTo || '');
    } else {
      fetchTask();
    }
  }, [contextTask, id, isEdit, projectId, navigate]);

  useEffect(() => {
    if (!projectId) {
      setError('Project ID is required. Please configure it in Settings.');
    }
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!projectId) {
      setError('Project ID is required. Please configure it in Settings.');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > 200) {
      setError('Title must be less than 200 characters');
      return;
    }

    if (description.length > 5000) {
      setError('Description must be less than 5000 characters');
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
        assignedTo: assignedTo.trim() || undefined,
      };

      if (isEdit && id) {
        await updateTask(id, taskData);
        toast.success('Task updated successfully');
      } else {
        await addTask(taskData);
        toast.success('Task created successfully');
      }

      navigate('/tasks');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save task';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="mb-6">{isEdit ? 'Edit Task' : 'Create Task'}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e5e7eb] p-8" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-lg border border-[#fecaca]"
            style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
          >
            {error}
          </div>
        )}

        {!projectId && (
          <div
            className="mb-6 px-4 py-3 rounded-lg border border-[#fecaca]"
            style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
          >
            Project ID is required. Please configure it in{' '}
            <a href="#/settings" className="underline">
              Settings
            </a>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title">
              Title <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
              required
              disabled={!projectId}
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              {title.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Enter task description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={5000}
              rows={6}
              className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827] resize-y"
              disabled={!projectId}
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              {description.length}/5000 characters
            </p>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
                disabled={!projectId}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
                disabled={!projectId}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date and Assigned To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
                disabled={!projectId}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="assignedTo">Assign To</label>
              <input
                id="assignedTo"
                type="text"
                placeholder="User ID (optional)"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
                disabled={!projectId}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-[#e5e7eb]">
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="px-4 py-2 border border-[#d1d5db] rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !projectId}
            className="px-4 py-[0.6rem] bg-[#111827] text-white rounded-md hover:bg-[#1f2937] transition-colors disabled:opacity-60"
          >
            {loading ? 'Saving...' : isEdit ? 'Save Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};
