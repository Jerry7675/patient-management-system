import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Stethoscope, Settings, Shield, AlertCircle } from 'lucide-react';
import {useNavigate} from 'react-router-dom';
const Login = ({  onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Mock user data for demonstration
  const mockUsers = {
    'patient@demo.com': {
      password: 'password123',
      role: 'patient',
      isVerified: true,
      name: 'John Patient',
      uid: 'patient-001'
    },
    'doctor@demo.com': {
      password: 'password123',
      role: 'doctor',
      isVerified: true,
      name: 'Dr. Sarah Wilson',
      uid: 'doctor-001',
      specialization: 'Cardiology'
    },
    'management@demo.com': {
      password: 'password123',
      role: 'management',
      isVerified: true,
      name: 'Mike Manager',
      uid: 'management-001',
      department: 'Medical Records'
    },
    'admin@demo.com': {
      password: 'password123',
      role: 'admin',
      isVerified: true,
      name: 'Admin User',
      uid: 'admin-001'
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user exists in mock data
      const user = mockUsers[formData.email.toLowerCase()];
      
      if (!user) {
        setErrors({ general: 'No account found with this email address.' });
        return;
      }
      
      if (user.password !== formData.password) {
        setErrors({ general: 'Invalid password. Please try again.' });
        return;
      }
      
      if (!user.isVerified) {
        setErrors({ 
          general: 'Your account is pending admin verification. Please wait for approval.' 
        });
        return;
      }
      
      // Successful login
      const loginData = {
        user: {
          uid: user.uid,
          email: formData.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          specialization: user.specialization,
          department: user.department
        },
        timestamp: new Date()
      };
      
      // Store login data (in real app, this would be handled by Firebase Auth)
      console.log('Login successful:', loginData);
      
      // Call the login callback if provided
      if (onLogin) {
        onLogin(loginData.user);
      }
      
      // Navigate to appropriate dashboard based on role
      const dashboardRoutes = {
        patient: 'patient-dashboard',
        doctor: 'doctor-dashboard',
        management: 'management-dashboard',
        admin: 'admin-dashboard'
      };
      
      if (onNavigate && dashboardRoutes[user.role]) {
        onNavigate(dashboardRoutes[user.role]);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'patient': return User;
      case 'doctor': return Stethoscope;
      case 'management': return Settings;
      case 'admin': return Shield;
      default: return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'patient': return 'text-blue-600';
      case 'doctor': return 'text-green-600';
      case 'management': return 'text-orange-600';
      case 'admin': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Sign in to your patient management account
          </p>
        </div>

        {/* Demo Credentials Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Demo Credentials:</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(mockUsers).map(([email, user]) => {
              const IconComponent = getRoleIcon(user.role);
              return (
                <div key={email} className="flex items-center space-x-1">
                  <IconComponent className={`w-3 h-3 ${getRoleColor(user.role)}`} />
                  <span className="text-gray-700">{email}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-blue-700 mt-2">Password for all: password123</p>
        </div>

        {/* Login Form */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')
}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              } transition-colors`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Registration Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')
}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Create account
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Role Information */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Roles</h3>
          <div className="space-y-3">
            {[
              { role: 'patient', desc: 'View medical records and request corrections' },
              { role: 'doctor', desc: 'Verify records and manage patient diagnoses' },
              { role: 'management', desc: 'Enter patient records and manage reports' },
              { role: 'admin', desc: 'Verify accounts and system administration' }
            ].map(({ role, desc }) => {
              const IconComponent = getRoleIcon(role);
              return (
                <div key={role} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <IconComponent className={`w-5 h-5 ${getRoleColor(role)}`} />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 capitalize">{role}:</span>
                    <span className="text-gray-600 ml-1">{desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;