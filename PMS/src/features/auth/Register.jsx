import { useState, useMemo } from 'react';
import { registerUser } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import ProfileForm from '../../components/ProfileForm';

export default function Register() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: '',
  });
  const [error, setError] = useState('');
  const [registeredUid, setRegisteredUid] = useState(null);

  const passwordStrength = useMemo(() => {
    if (!form.password) return 0;

    let strength = 0;
    if (form.password.length >= 8) strength += 1;
    if (form.password.length >= 12) strength += 1;
    if (/[A-Z]/.test(form.password)) strength += 1;
    if (/[0-9]/.test(form.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) strength += 1;

    return Math.min(strength, 5);
  }, [form.password]);

  const passwordStrengthText = useMemo(() => {
    if (!form.password) return '';
    const strengthMap = {
      1: 'Very Weak',
      2: 'Weak',
      3: 'Moderate',
      4: 'Strong',
      5: 'Very Strong'
    };
    return strengthMap[passwordStrength] || '';
  }, [passwordStrength]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (passwordStrength < 3) {
      setError('Password is too weak. Please use a stronger password.');
      return;
    }

    try {
      const user = await registerUser(form);
      setRegisteredUid(user.uid);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStrengthColor = (strength) => {
    const colors = [
      'bg-red-500',
      'bg-orange-400',
      'bg-yellow-400',
      'bg-blue-400',
      'bg-green-400'
    ];
    return colors[strength - 1] || 'bg-gray-200';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        {registeredUid ? (
          <ProfileForm userUid={registeredUid} redirectAfterSave={true} />
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-indigo-700 mb-2">Create Account</h2>
              <p className="text-indigo-500">Join our healthcare platform today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                  minLength="8"
                />

                {form.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Password Strength</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength <= 1 ? 'text-red-500' :
                        passwordStrength <= 2 ? 'text-orange-500' :
                        passwordStrength <= 3 ? 'text-yellow-500' :
                        passwordStrength <= 4 ? 'text-blue-500' : 'text-green-500'
                      }`}>
                        {passwordStrengthText}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-500 mt-2">
                      <li className={`flex items-center ${form.password.length >= 8 ? 'text-green-500' : ''}`}>
                        <span className="mr-1">✓</span> 8+ characters
                      </li>
                      <li className={`flex items-center ${/[A-Z]/.test(form.password) ? 'text-green-500' : ''}`}>
                        <span className="mr-1">✓</span> Uppercase
                      </li>
                      <li className={`flex items-center ${/[0-9]/.test(form.password) ? 'text-green-500' : ''}`}>
                        <span className="mr-1">✓</span> Number
                      </li>
                      <li className={`flex items-center ${/[^A-Za-z0-9]/.test(form.password) ? 'text-green-500' : ''}`}>
                        <span className="mr-1">✓</span> Special char
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select your role</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="management">Management</option>
                </select>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-all ${
                  passwordStrength < 3 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
                disabled={passwordStrength < 3}
              >
                Create Account
              </button>
            </form>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start mt-4">
                <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="text-center mt-6 text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/" className="text-indigo-600 font-medium hover:underline">
                Sign in
              </Link>
            </div>

            <div className="text-xs text-center mt-6 text-gray-400">
              By registering, you agree to our{' '}
              <Link to="/privacy-policy" className="text-indigo-500 underline hover:text-indigo-600">
                Privacy Policy
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
