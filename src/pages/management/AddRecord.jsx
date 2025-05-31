import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar, 
  FileText, 
  Upload, 
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Camera,
  X
} from 'lucide-react';

const AddRecord = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1); // 1: Auth, 2: OTP, 3: Record Form
  const [loading, setLoading] = useState(false);
  
  // Authentication Step
  const [authData, setAuthData] = useState({
    managementEmail: '',
    managementPassword: '',
    patientName: '',
    patientPassword: ''
  });
  
  // OTP Step
  const [otpData, setOtpData] = useState({
    otp: '',
    generatedOtp: '', // In real app, this would be sent to patient's email
    otpExpiry: null,
    otpVerified: false
  });
  
  // Record Form Step
  const [recordData, setRecordData] = useState({
    patientName: '',
    doctorName: '',
    date: '',
    diagnosedDisease: '',
    symptoms: '',
    reportImages: [],
    prescriptions: [
      {
        id: 1,
        medicineName: '',
        dosage: '',
        frequency: '',
        timeInterval: '',
        duration: ''
      }
    ],
    recommendations: '',
    caseStatus: 'stable', // improving, stable, deteriorating
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Handle authentication step
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      // Validate management credentials
      if (!authData.managementEmail || !authData.managementPassword) {
        throw new Error('Management credentials are required');
      }
      
      if (!authData.patientName || !authData.patientPassword) {
        throw new Error('Patient credentials are required');
      }
      
      // Simulate API call to verify credentials and generate OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate OTP (in real app, this would be sent to patient's email)
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      setOtpData({
        ...otpData,
        generatedOtp,
        otpExpiry: expiry
      });
      
      setRecordData({
        ...recordData,
        patientName: authData.patientName
      });
      
      setCurrentStep(2);
      setSuccessMessage(`OTP sent to patient's registered email. OTP: ${generatedOtp} (Demo)`);
      
    } catch (error) {
      setErrors({ auth: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      if (!otpData.otp) {
        throw new Error('Please enter the OTP');
      }
      
      if (otpData.otp !== otpData.generatedOtp) {
        throw new Error('Invalid OTP. Please try again.');
      }
      
      if (new Date() > otpData.otpExpiry) {
        throw new Error('OTP has expired. Please regenerate.');
      }
      
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOtpData({ ...otpData, otpVerified: true });
      setCurrentStep(3);
      setSuccessMessage('OTP verified successfully! You can now enter the patient record.');
      
    } catch (error) {
      setErrors({ otp: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setErrors({ ...errors, files: `${file.name} is too large. Max size is 5MB.` });
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, files: `${file.name} is not a valid file type.` });
        return false;
      }
      return true;
    });
    
    setRecordData({
      ...recordData,
      reportImages: [...recordData.reportImages, ...validFiles]
    });
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove uploaded file
  const removeFile = (index) => {
    const updatedFiles = recordData.reportImages.filter((_, i) => i !== index);
    setRecordData({ ...recordData, reportImages: updatedFiles });
  };

  // Add prescription
  const addPrescription = () => {
    const newPrescription = {
      id: recordData.prescriptions.length + 1,
      medicineName: '',
      dosage: '',
      frequency: '',
      timeInterval: '',
      duration: ''
    };
    setRecordData({
      ...recordData,
      prescriptions: [...recordData.prescriptions, newPrescription]
    });
  };

  // Remove prescription
  const removePrescription = (id) => {
    if (recordData.prescriptions.length > 1) {
      const updatedPrescriptions = recordData.prescriptions.filter(p => p.id !== id);
      setRecordData({ ...recordData, prescriptions: updatedPrescriptions });
    }
  };

  // Update prescription
  const updatePrescription = (id, field, value) => {
    const updatedPrescriptions = recordData.prescriptions.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    setRecordData({ ...recordData, prescriptions: updatedPrescriptions });
  };

  // Handle record submission
  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      // Validate required fields
      const requiredFields = ['doctorName', 'date', 'diagnosedDisease'];
      const missingFields = requiredFields.filter(field => !recordData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in: ${missingFields.join(', ')}`);
      }
      
      // Validate prescriptions
      const invalidPrescriptions = recordData.prescriptions.filter(p => 
        !p.medicineName || !p.dosage || !p.frequency
      );
      
      if (invalidPrescriptions.length > 0) {
        throw new Error('Please complete all prescription fields');
      }
      
      // Simulate API call to save record
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccessMessage('Record added successfully! Doctor will be notified for verification.');
      
      // Reset form and redirect after delay
      setTimeout(() => {
        navigate('/management/dashboard');
      }, 2000);
      
    } catch (error) {
      setErrors({ record: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Regenerate OTP
  const regenerateOtp = async () => {
    setLoading(true);
    try {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const newExpiry = new Date(Date.now() + 10 * 60 * 1000);
      
      setOtpData({
        ...otpData,
        generatedOtp: newOtp,
        otpExpiry: newExpiry,
        otp: ''
      });
      
      setSuccessMessage(`New OTP sent: ${newOtp} (Demo)`);
      
    } catch (error) {
      setErrors({ otp: 'Failed to regenerate OTP' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/management/dashboard')}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Add Patient Record</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && <div className="w-8 h-1 bg-gray-200 mx-2"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Authentication */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                Authentication Required
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Verify management and patient credentials to proceed
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-6">
              {/* Management Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Management Verification</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Management Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={authData.managementEmail}
                          onChange={(e) => setAuthData({ ...authData, managementEmail: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="management@hospital.com"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Management Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="password"
                          value={authData.managementPassword}
                          onChange={(e) => setAuthData({ ...authData, managementPassword: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter password"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Patient Verification</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={authData.patientName}
                          onChange={(e) => setAuthData({ ...authData, patientName: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="password"
                          value={authData.patientPassword}
                          onChange={(e) => setAuthData({ ...authData, patientPassword: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter patient password"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {errors.auth && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{errors.auth}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Generate OTP'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Phone className="h-5 w-5 text-green-600 mr-2" />
                OTP Verification
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Ask the patient for the OTP sent to their registered email
              </p>
            </div>

            <form onSubmit={handleOtpVerification} className="space-y-6">
              <div className="max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otpData.otp}
                    onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    OTP expires in: <span className="font-medium text-red-600">
                      {otpData.otpExpiry ? Math.max(0, Math.floor((otpData.otpExpiry - new Date()) / 1000 / 60)) : 0} minutes
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={regenerateOtp}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Regenerate OTP
                  </button>
                </div>
              </div>

              {errors.otp && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{errors.otp}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Record Form */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-2" />
                Patient Record Entry
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Enter the patient's medical record details
              </p>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={recordData.patientName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Name *
                  </label>
                  <input
                    type="text"
                    value={recordData.doctorName}
                    onChange={(e) => setRecordData({ ...recordData, doctorName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={recordData.date}
                      onChange={(e) => setRecordData({ ...recordData, date: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Case Status
                  </label>
                  <select
                    value={recordData.caseStatus}
                    onChange={(e) => setRecordData({ ...recordData, caseStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="improving">Improving</option>
                    <option value="stable">Stable</option>
                    <option value="deteriorating">Deteriorating</option>
                  </select>
                </div>
              </div>

              {/* Medical Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosed Disease *
                </label>
                <input
                  type="text"
                  value={recordData.diagnosedDisease}
                  onChange={(e) => setRecordData({ ...recordData, diagnosedDisease: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter diagnosis"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms
                </label>
                <textarea
                  value={recordData.symptoms}
                  onChange={(e) => setRecordData({ ...recordData, symptoms: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe symptoms..."
                />
              </div>

              {/* Report Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Upload Files
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      PNG, JPG, GIF, PDF up to 5MB each
                    </p>
                  </div>
                </div>

                {/* Uploaded Files */}
                {recordData.reportImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recordData.reportImages.map((file, index) => (
                      <div key={index} className="relative bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-blue-600 mr-2" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Prescriptions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Prescriptions *
                  </label>
                  <button
                    type="button"
                    onClick={addPrescription}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Prescription
                  </button>
                </div>

                {recordData.prescriptions.map((prescription, index) => (
                  <div key={prescription.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        Prescription {index + 1}
                      </h4>
                      {recordData.prescriptions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrescription(prescription.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Medicine Name *
                        </label>
                        <input
                          type="text"
                          value={prescription.medicineName}
                          onChange={(e) => updatePrescription(prescription.id, 'medicineName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Paracetamol"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Dosage *
                        </label>
                        <input
                          type="text"
                          value={prescription.dosage}
                          onChange={(e) => updatePrescription(prescription.id, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="500mg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Frequency *
                        </label>
                        <input
                          type="text"
                          value={prescription.frequency}
                          onChange={(e) => updatePrescription(prescription.id, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="3 times a day"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Time Interval
                        </label>
                        <input
                          type="text"
                          value={prescription.timeInterval}
                          onChange={(e) => updatePrescription(prescription.id, 'timeInterval', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Every 8 hours"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={prescription.duration}
                        onChange={(e) => updatePrescription(prescription.id, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="7 days"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommendations to Patient
                </label>
                <textarea
                  value={recordData.recommendations}
                  onChange={(e) => setRecordData({ ...recordData, recommendations: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter recommendations for the patient..."
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={recordData.notes}
                  onChange={(e) => setRecordData({ ...recordData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes..."
                />
              </div>

              {errors.record && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{errors.record}</p>
                    </div>
                  </div>
                </div>
              )}

              {errors.files && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">{errors.files}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/management/dashboard')}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving Record...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Add Record
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mt-8 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                Step {currentStep} of 3
              </span>
            </div>
            <div className="text-gray-600">
              {currentStep === 1 && 'Authentication Required'}
              {currentStep === 2 && 'OTP Verification'}
              {currentStep === 3 && 'Record Entry'}
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Important Notes:</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Patient will receive OTP on their registered email address</li>
                  <li>All records require doctor verification before being visible to patients</li>
                  <li>Upload clear images of reports (max 5MB each)</li>
                  <li>Complete all prescription details including dosage and frequency</li>
                  <li>Doctor will be notified immediately after record submission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRecord;