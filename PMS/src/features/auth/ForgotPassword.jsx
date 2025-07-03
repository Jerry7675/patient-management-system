
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import auth from '../../firebase/auth';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ success: '', error: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: '', error: '' });

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus({
        success: 'Password reset email sent. Please check your inbox.',
        error: '',
      });
    } catch (err) {
      setStatus({
        success: '',
        error: err.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-200 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">Forgot Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />

          {status.error && <p className="text-red-600 text-sm">{status.error}</p>}
          {status.success && <p className="text-green-600 text-sm">{status.success}</p>}

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded transition"
          >
            Send Reset Link
          </button>
        </form>

        <div className="text-sm text-center mt-4">
          <Link to="/login" className="text-orange-600 hover:underline font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
