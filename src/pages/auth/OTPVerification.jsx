// File: src/pages/auth/OTPVerification.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateOTP } from '../../utils/validators';
import LoadingSpinner, { ButtonSpinner } from '../../components/common/LoadingSpinner';
import { TIME_CONSTANTS } from '../../utils/constants';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);
  
  // Get data from navigation state
  const { email, patientName, purpose, redirectTo } = location.state || {};
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Redirect if no required data
  useEffect(() => {
    if (!email || !patientName) {
      navigate('/management/patient-search', { replace: true });
    }
  }, [email, patientName, navigate]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear error when user starts typing
    if (error) setError('');
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        if (digits.length === 6) {
          const newOtp = digits.split('');
          setOtp(newOtp);
          inputRefs.current[5]?.focus();
        }
      });
    }
  };

  const validateOtpCode = () => {
    const otpString = otp.join('');
    const validationError = validateOTP(otpString);
    
    if (validationError) {
      setError(validationError);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateOtpCode()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const otpString = otp.join('');
      
      // TODO: Implement actual OTP verification with backend
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock OTP verification - replace with actual API call
      if (otpString === '123456') { // Mock valid OTP
        // Navigate based on purpose
        if (purpose === 'record-entry') {
          navigate('/management/record-entry', {
            state: {
              patientName,
              patientEmail: email,
              isAuthorized: true
            }
          });
        } else {
          navigate(redirectTo || '/management/dashboard');
        }
      } else {
        throw new Error('Invalid OTP. Please check and try again.');
      }
      
    } catch (error) {
      setError(error.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setIsResending(true);
    setError('');
    
    try {
      // TODO: Implement actual OTP resend with backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset timer and OTP
      setTimeLeft(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      // Show success message (you might want to use a toast here)
      console.log('OTP resent successfully');
      
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Patient Authorization Required
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit OTP sent to patient's email
          </p>
        </div>

        {/* Patient Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Patient Information
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p><span className="font-medium">Name:</span> {patientName}</p>
                <p><span className="font-medium">Email:</span> {email}</p>
                <p><span className="font-medium">Purpose:</span> {purpose === 'record-entry' ? 'Medical Record Entry' : 'Account Verification'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {error}
              </div>
            </div>
          )}

          {/* OTP Input Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-center mb-4">
              Enter 6-Digit OTP
            </label>
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm text-gray-600">
                OTP expires in: <span className="font-medium text-red-600">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-sm text-red-600 font-medium">
                OTP has expired. Please resend to get a new one.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || timeLeft === 0}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <ButtonSpinner size="small" />
                  <span className="ml-2">Verifying...</span>
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>

            {/* Resend Button */}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={!canResend || isResending}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? (
                <>
                  <ButtonSpinner size="small" />
                  <span className="ml-2">Resending...</span>
                </>
              ) : (
                'Resend OTP'
              )}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancel}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Instructions
              </h3>
              <div className="mt-1 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Ask the patient to check their email for the OTP</li>
                  <li>OTP is valid for 5 minutes only</li>
                  <li>Patient must provide the OTP to authorize record entry</li>
                  <li>Do not proceed without patient's explicit consent</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;