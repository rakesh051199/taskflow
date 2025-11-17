import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const HomePage: React.FC = () => {
  const { auth } = useApp();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="mb-4">Welcome to TaskFlow</h1>
        <p className="mb-8" style={{ fontSize: '1.125rem', color: '#6b7280' }}>
          A modern task management system for teams and individuals. Track your projects,
          manage priorities, and collaborate efficiently.
        </p>

        {auth.isAuthenticated ? (
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-[#111827] text-white rounded-md hover:bg-[#1f2937] transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/tasks"
              className="px-6 py-3 border border-[#d1d5db] rounded-md hover:bg-gray-50 transition-colors"
            >
              View Tasks
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-[#111827] text-white rounded-md hover:bg-[#1f2937] transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 border border-[#d1d5db] rounded-md hover:bg-gray-50 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
            <h3 className="mb-2">Task Management</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Create, organize, and track tasks with customizable statuses and priorities.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
            <h3 className="mb-2">Analytics Dashboard</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              View insights, completion rates, and visualize your project progress.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6" style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
            <h3 className="mb-2">Team Collaboration</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Assign tasks, track team members, and collaborate effectively.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
