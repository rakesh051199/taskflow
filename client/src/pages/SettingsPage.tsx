import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { setApiBaseUrl, getApiBaseUrl } from '../lib/apiClient';

export const SettingsPage: React.FC = () => {
  const { projectId, setProjectId } = useApp();
  const [apiBaseUrl, setApiBaseUrlState] = useState(
    getApiBaseUrl()
  );
  const [projectIdInput, setProjectIdInput] = useState(projectId || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProjectIdInput(projectId || '');
  }, [projectId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate URL
      if (apiBaseUrl) {
        try {
          new URL(apiBaseUrl);
          setApiBaseUrl(apiBaseUrl);
          localStorage.setItem('taskflow_api_base', apiBaseUrl);
        } catch {
          toast.error('Invalid API Base URL format');
          setLoading(false);
          return;
        }
      }

      // Validate and save projectId
      if (projectIdInput.trim()) {
        // Basic MongoDB ObjectId format validation (24 hex characters)
        if (!/^[0-9a-fA-F]{24}$/.test(projectIdInput.trim())) {
          toast.error('Invalid Project ID format. Must be a valid MongoDB ObjectId (24 hex characters)');
          setLoading(false);
          return;
        }
        setProjectId(projectIdInput.trim());
        localStorage.setItem('taskflow_project_id', projectIdInput.trim());
        sessionStorage.setItem('taskflow_project_id', projectIdInput.trim());
        toast.success('Settings saved successfully');
      } else {
        toast.error('Project ID is required');
      }
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="mb-6">Settings</h1>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-[#e5e7eb] p-8"
        style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}
      >
        <div className="flex flex-col gap-6">
          {/* Project ID */}
          <div className="flex flex-col gap-2">
            <label htmlFor="projectId">Project ID *</label>
            <input
              id="projectId"
              type="text"
              placeholder="507f1f77bcf86cd799439011"
              value={projectIdInput}
              onChange={e => setProjectIdInput(e.target.value)}
              className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
              required
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              MongoDB ObjectId of the project (24 hex characters). Required for all task operations.
            </p>
          </div>

          {/* API Base URL */}
          <div className="flex flex-col gap-2">
            <label htmlFor="apiBaseUrl">API Base URL</label>
            <input
              id="apiBaseUrl"
              type="text"
              placeholder="http://localhost:3000"
              value={apiBaseUrl}
              onChange={e => setApiBaseUrlState(e.target.value)}
              className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              The base URL for your API endpoints
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-[#e5e7eb]">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-[0.6rem] bg-[#111827] text-white rounded-md hover:bg-[#1f2937] transition-colors disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};
