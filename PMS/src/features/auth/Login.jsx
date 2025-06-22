import { useState } from 'react';
import { loginUser } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { role, verified } = await loginUser(form.email, form.password);

      if (!verified) {
        navigate('/verification-pending');
        return;
      }

      // Redirect verified user to role-based dashboard
      if (role === 'patient') navigate('/patient/dashboard');
      else if (role === 'doctor') navigate('/doctor/dashboard');
      else if (role === 'management') navigate('/management/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
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
