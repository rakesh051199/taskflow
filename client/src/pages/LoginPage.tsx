import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="w-full bg-white rounded-xl border border-[#e5e7eb] p-8"
        style={{ maxWidth: '400px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}
      >
        <h1 className="mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div
              className="px-4 py-3 rounded-lg border border-[#fecaca]"
              style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-[0.6rem] bg-[#111827] text-white rounded-md hover:bg-[#1f2937] transition-colors disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p style={{ fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#111827] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
