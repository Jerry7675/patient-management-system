// src/features/auth/Login.jsx

import { useState } from 'react';
import { loginUser } from '../../services/authService';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError('❗ You must agree to the privacy policy before logging in.');
      return;
    }

    try {
      const { role, status, user } = await loginUser(form.email, form.password);

      if (status === 'pending') {
        navigate('/verification-pending');
        return;
      }

      if (status === 'rejected') {
        navigate('/rejected');
        return;
      }

      if (status === 'verified') {
        navigate('/verify-otp', {
          state: {
            email: form.email,
            userId: user.uid, // make sure this key matches OTPVerification.jsx
            role,
            from: location.pathname
          }
        });
        return;
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="privacy"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="privacy" className="text-sm text-gray-700">
              I agree to the{' '}
              <Link to="/privacy-policy" className="text-indigo-600 hover:underline">
                privacy policy
              </Link>
            </label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition"
          >
            Login
          </button>
        </form>

        <div className="flex justify-between items-center mt-4 text-sm">
          <Link to="/forgot-password" className="text-indigo-500 hover:underline">
            Forgot Password?
          </Link>
          <Link to="/register" className="text-gray-600 hover:text-indigo-600 font-medium">
            New User? Register
          </Link>
        </div>
      </div>
    </div>
  );
}
