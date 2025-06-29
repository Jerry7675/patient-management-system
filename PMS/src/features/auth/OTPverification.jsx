// src/features/auth/OTPVerification.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOTP, sendOTP } from '../../services/otpService';
import { verifyUserWithOTP } from '../../services/authService';

export default function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();
  const { state } = useLocation();
  const { email, userId, role } = state || {};

  useEffect(() => {
    if (!email || !userId || !role) {
      navigate('/login');
    }
  }, [email, userId, role, navigate]);

useEffect(() => {
  if (email && userId) {
    const key = `otp_sent_${userId}`;
    const hasSent = sessionStorage.getItem(key);

    if (!hasSent) {
      sendOTP(email, userId)
        .then(() => {
          sessionStorage.setItem(key, 'true');
          setError('');
          setOtpSent(true);
        })
        .catch(() => setError('Failed to send OTP. Please try again.'));
    } else {
      setOtpSent(true); // allow verify even if OTP already sent before
    }
  }
}, [email, userId]);


  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer === 0) setCanResend(true);
  }, [timer]);

  const handleVerify = async () => {
    try {
      setLoading(true);
      await verifyOTP(userId, otp); // ✅ Only call verifyOTP here
      await verifyUserWithOTP(userId); // ✅ No need to pass OTP again

      // Redirect based on role
      switch (role) {
        case 'patient':
          navigate('/patient/dashboard');
          break;
        case 'doctor':
          navigate('/doctor/dashboard');
          break;
        case 'management':
          navigate('/management/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setOtp('');
    setCanResend(false);
    setTimer(60);

    try {
      await sendOTP(email, userId);
      setOtpSent(true);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  if (!email || !userId || !role) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">OTP Verification</h2>
        <p className="mb-4 text-center">
          We've sent a 6-digit code to <span className="font-semibold">{email}</span>
        </p>

        <div className="mb-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-xl font-mono tracking-widest"
            placeholder="------"
            maxLength="6"
            autoFocus
          />
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
        )}

        <button
          onClick={handleVerify}
          disabled={otp.length !== 6 || loading}
          className={`w-full py-2 px-4 rounded-md transition ${
            otp.length === 6 && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Verifying...
            </span>
          ) : (
            'Verify'
          )}
        </button>

        <div className="mt-4 text-center text-sm">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-blue-600 hover:text-blue-800"
              disabled={loading}
            >
              Resend OTP
            </button>
          ) : (
            <p>Resend OTP in {timer} seconds</p>
          )}
        </div>
      </div>
    </div>
  );
}
