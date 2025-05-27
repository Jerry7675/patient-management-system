import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, Calendar, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const PatientSearch = ({ onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientPassword, setPatientPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchType, setSearchType] = useState('name'); // name, email, phone

  // Mock patient data - Replace with Firebase integration
  const mockPatients = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1234567890',
      dateOfBirth: '1990-05-15',
      patientId: 'PID001',
      isVerified: true
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1234567891',
      dateOfBirth: '1985-08-22',
      patientId: 'PID002',
      isVerified: true
    },
    {
      id: '3',
      name: 'Robert Johnson',
      email: 'robert.j@email.com',
      phone: '+1234567892',
      dateOfBirth: '1992-12-10',
      patientId: 'PID003',
      isVerified: false
    }
  ];

  // Search patients based on search term and type
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      const results = mockPatients.filter(patient => {
        switch (searchType) {
          case 'name':
            return patient.name.toLowerCase().includes(searchTerm.toLowerCase());
          case 'email':
            return patient.email.toLowerCase().includes(searchTerm.toLowerCase());
          case 'phone':
            return patient.phone.includes(searchTerm);
          case 'patientId':
            return patient.patientId.toLowerCase().includes(searchTerm.toLowerCase());
          default:
            return false;
        }
      });

      setSearchResults(results);
      setLoading(false);

      if (results.length === 0) {
        setError('No patients found matching your search criteria');
      }
    }, 1000);
  };

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    if (!patient.isVerified) {
      setError('This patient account is not verified by admin. Please contact admin.');
      return;
    }
    setSelectedPatient(patient);
    setError('');
    setSuccess('');
  };

  // Send OTP to patient
  const handleSendOTP = async () => {
    if (!patientPassword.trim()) {
      setError('Please enter patient password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate password verification and OTP sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock password verification (replace with actual verification)
      const isPasswordValid = patientPassword === 'patient123'; // Mock password
      
      if (!isPasswordValid) {
        setError('Invalid patient password. Please verify with the patient.');
        setLoading(false);
        return;
      }

      // Mock OTP generation and sending
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      
      // In real implementation, send OTP to patient's email
      console.log(`OTP sent to ${selectedPatient.email}: ${generatedOTP}`);
      
      setOtpSent(true);
      setSuccess(`OTP has been sent to ${selectedPatient.email}. Please ask the patient to share the OTP.`);
      setLoading(false);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      setLoading(false);
    }
  };

  // Verify OTP and proceed
  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP shared by patient');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock OTP verification (replace with actual verification)
      const isOTPValid = otp.length === 6; // Simple validation
      
      if (!isOTPValid) {
        setError('Invalid OTP. Please verify with the patient.');
        setLoading(false);
        return;
      }

      setSuccess('Patient verified successfully! You can now proceed to add records.');
      
      // Call parent callback to proceed with record entry
      if (onPatientSelect) {
        onPatientSelect(selectedPatient);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedPatient(null);
    setPatientPassword('');
    setOtpSent(false);
    setOtp('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Search</h2>
        <p className="text-gray-600">Search for a patient to add medical records</p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {!selectedPatient ? (
        <>
          {/* Search Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search By
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Patient Name</option>
                  <option value="email">Email Address</option>
                  <option value="phone">Phone Number</option>
                  <option value="patientId">Patient ID</option>
                </select>
              </div>
              <div className="flex-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Term
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Enter ${searchType === 'name' ? 'patient name' : searchType === 'email' ? 'email address' : searchType === 'phone' ? 'phone number' : 'patient ID'}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results</h3>
              <div className="grid gap-4">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      patient.isVerified
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{patient.name}</h4>
                          <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="flex items-center text-sm text-gray-500">
                              <Mail className="w-4 h-4 mr-1" />
                              {patient.email}
                            </span>
                            <span className="flex items-center text-sm text-gray-500">
                              <Phone className="w-4 h-4 mr-1" />
                              {patient.phone}
                            </span>
                            <span className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(patient.dateOfBirth).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {patient.isVerified ? (
                          <span className="flex items-center text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-sm text-red-600 bg-red-100 px-2 py-1 rounded-full">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Not Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Selected Patient Verification */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Verification</h3>
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-800">{selectedPatient.name}</h4>
                  <p className="text-gray-600">ID: {selectedPatient.patientId}</p>
                  <p className="text-gray-600">{selectedPatient.email}</p>
                </div>
              </div>
            </div>

            {!otpSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Password
                  </label>
                  <input
                    type="password"
                    value={patientPassword}
                    onChange={(e) => setPatientPassword(e.target.value)}
                    placeholder="Enter patient's password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Ask the patient to provide their account password
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                  >
                    {loading ? <Loader className="w-5 h-5 animate-spin mr-2" /> : null}
                    Send OTP to Patient
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Ask the patient to share the OTP they received via email
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
                  >
                    {loading ? <Loader className="w-5 h-5 animate-spin mr-2" /> : null}
                    Verify OTP
                  </button>
                  <button
                    onClick={() => setOtpSent(false)}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500"
                  >
                    Resend OTP
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PatientSearch;