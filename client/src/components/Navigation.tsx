import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Navigation: React.FC = () => {
  const { auth, logout, projectId } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout fails
      navigate('/login');
    }
  };

  return (
    <nav className="border-b border-[#e5e7eb] bg-white">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="mr-4">
            <h1 style={{ fontSize: '1.25rem', margin: 0 }}>TaskFlow</h1>
          </Link>
          <Link
            to="/settings"
            className="text-[#6b7280] hover:text-[#111827] transition-colors"
          >
            Settings
          </Link>
          {auth.isAuthenticated && !isAuthPage && (
            <>
              <Link
                to="/dashboard"
                className="text-[#6b7280] hover:text-[#111827] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/tasks"
                className="text-[#6b7280] hover:text-[#111827] transition-colors"
              >
                Tasks
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {auth.isAuthenticated ? (
            <>
              <span className="text-[#6b7280]" style={{ fontSize: '0.875rem' }}>
                {auth.user?.email}
              </span>
              {!projectId && (
                <span className="text-[#f59e0b]" style={{ fontSize: '0.75rem' }}>
                  No Project ID
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-[#d1d5db] rounded-md hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-[#6b7280] hover:text-[#111827] transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
