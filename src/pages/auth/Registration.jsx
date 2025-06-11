import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, UserCheck, Stethoscope, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../hooks/useAuth';

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: '',
    address: '',
    dob: '',
    specialization: '',
    licenseNumber: '',
    employeeId: '',
    department: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const roleOptions = [
    { value: 'patient', label: 'Patient', icon: User, color: 'blue' },
    { value: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'green' },
    { value: 'management', label: 'Management', icon: Settings, color: 'orange' },
    { value: 'admin', label: 'Admin', icon: Shield, color: 'red' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (formData.dob && new Date(formData.dob) > new Date()) newErrors.dob = 'Date of birth cannot be in the future';

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';

    if (formData.role === 'doctor') {
      if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    }

    if (formData.role === 'management') {
      if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
      if (!formData.department.trim()) newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const result = await authService.register({
        displayName: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phone,
        address: formData.address,
        dob: formData.dob,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        employeeId: formData.employeeId,
        department: formData.department,
        adminCode: formData.role === 'admin' ? 'DEFAULT_ADMIN_CODE' : undefined
      });

      if (!result.success) {
        setErrors({ general: result.error || 'Registration failed' });
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      console.error('❌ Registration error:', err);
      setErrors({ general: err.message || 'Unexpected error' });
    }

    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'doctor':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialization *
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.specialization ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Cardiology, Pediatrics"
              />
              {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical License Number *
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Medical license number"
              />
              {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
            </div>
          </>
        );

      case 'management':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.employeeId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Employee ID"
              />
              {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Department</option>
                <option value="records">Medical Records</option>
                <option value="radiology">Radiology</option>
                <option value="laboratory">Laboratory</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="administration">Administration</option>
              </select>
              {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your {formData.role} account has been created and is pending admin verification. 
              You will receive an email once your account is approved.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose your role and fill in the details below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Role *</label>
            <div className="flex gap-4">
              {roleOptions.map(({ value, label, icon: Icon, color }) => {
                // Compose the border and bg classes dynamically for Tailwind
                const isSelected = formData.role === value;
                const borderColorClass = isSelected ? `border-${color}-600` : 'border-gray-300';
                const bgColorClass = isSelected ? `bg-${color}-600` : 'bg-white';
                const textColorClass = isSelected ? 'text-white' : `text-${color}-600`;

                // Since Tailwind doesn't support dynamic class names directly,
                // Use a helper function or template literals and classnames library,
                // But here, we'll hardcode a small map instead:

                const borderColorMap = {
                  blue: 'border-blue-600',
                  green: 'border-green-600',
                  orange: 'border-orange-600',
                  red: 'border-red-600'
                };

                const bgColorMap = {
                  blue: 'bg-blue-600',
                  green: 'bg-green-600',
                  orange: 'bg-orange-600',
                  red: 'bg-red-600'
                };

                const textColorMap = {
                  blue: 'text-blue-600',
                  green: 'text-green-600',
                  orange: 'text-orange-600',
                  red: 'text-red-600'
                };

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: value }))}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg border-2
                      ${isSelected ? borderColorMap[color] : 'border-gray-300'}
                      ${isSelected ? bgColorMap[color] : 'bg-white'}
                      ${isSelected ? 'text-white' : textColorMap[color]}
                      focus:outline-none focus:ring-2 focus:ring-offset-1
                      ${isSelected ? `focus:ring-${color}-400` : 'focus:ring-gray-400'}
                      transition-colors duration-200
                    `}
                    aria-pressed={isSelected}
                    aria-label={`Select role ${label}`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your full name"
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Re-enter password"
                required
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                onClick={() => setShowConfirmPassword(prev => !prev)}
                className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+977-9812345678"
              required
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              placeholder="Your address"
            />
          </div>

          {/* DOB */}
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.dob ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
          </div>

          {/* Role-specific fields */}
          {renderRoleSpecificFields()}

          {errors.general && <p className="text-red-600 text-center mb-2">{errors.general}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
                    <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;
