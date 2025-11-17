import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, firstName, lastName);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div
        className="w-full bg-white rounded-xl border border-[#e5e7eb] p-8"
        style={{ maxWidth: '400px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}
      >
        <h1 className="mb-6">Sign Up</h1>

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
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
              required
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Must contain uppercase, lowercase, and number
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="px-3 py-2 border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-[0.6rem] bg-[#111827] text-white rounded-md hover:bg-[#1f2937] transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p style={{ fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-[#111827] hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
