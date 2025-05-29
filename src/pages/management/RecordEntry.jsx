import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationBanner from '../../components/common/NotificationBanner';

const RecordEntry = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [step, setStep] = useState(1); // 1: Patient verification, 2: Record entry
  const [patientVerified, setPatientVerified] = useState(false);

  // Patient verification form state
  const [patientCredentials, setPatientCredentials] = useState({
    patientName: '',
    patientPassword: '',
    patientEmail: ''
  });

  // OTP verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // Record entry form state
  const [recordData, setRecordData] = useState({
    patientName: '',
    doctorName: '',
    date: new Date().toISOString().split('T')[0],
    diagnosedDisease: '',
    reportImages: [],
    prescriptions: [
      {
        medicine: '',
        dosage: '',
        frequency: '',
        timeInterval: '',
        duration: ''
      }
    ],
    recommendations: '',
    caseStatus: 'stable', // improving, stable, deteriorating
    additionalNotes: ''
  });

  // Available doctors list (in real app, this would come from Firebase)
  const [doctors, setDoctors] = useState([
    { id: '1', name: 'Dr. Smith', specialization: 'Cardiology' },
    { id: '2', name: 'Dr. Johnson', specialization: 'Neurology' },
    { id: '3', name: 'Dr. Brown', specialization: 'General Medicine' }
  ]);

  const handlePatientVerification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate patient verification API call
      const response = await fetch('/api/verify-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: patientCredentials.patientName,
          patientPassword: patientCredentials.patientPassword,
          patientEmail: patientCredentials.patientEmail,
          managementId: user.uid
        })
      });

      if (response.ok) {
        setPatientVerified(true);
        await sendOTP();
        setNotification({
          type: 'success',
          message: 'Patient verified! OTP sent to patient email.'
        });
      } else {
        throw new Error('Patient verification failed');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to verify patient credentials'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    try {
      // Simulate OTP sending
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientEmail: patientCredentials.patientEmail,
          purpose: 'record_entry'
        })
      });

      if (response.ok) {
        setOtpSent(true);
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate OTP verification
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientEmail: patientCredentials.patientEmail,
          otpCode: otpCode
        })
      });

      if (response.ok) {
        setOtpVerified(true);
        setStep(2);
        setRecordData(prev => ({
          ...prev,
          patientName: patientCredentials.patientName
        }));
        setNotification({
          type: 'success',
          message: 'OTP verified! You can now enter the medical record.'
        });
      } else {
        throw new Error('Invalid OTP code');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'OTP verification failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setNotification({
          type: 'error',
          message: `${file.name} is not a valid image format`
        });
        return false;
      }
      
      if (file.size > maxSize) {
        setNotification({
          type: 'error',
          message: `${file.name} is too large. Maximum size is 5MB`
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setRecordData(prev => ({
        ...prev,
        reportImages: [...prev.reportImages, ...validFiles]
      }));
    }
  };

  const removeImage = (index) => {
    setRecordData(prev => ({
      ...prev,
      reportImages: prev.reportImages.filter((_, i) => i !== index)
    }));
  };

  const addPrescription = () => {
    setRecordData(prev => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        {
          medicine: '',
          dosage: '',
          frequency: '',
          timeInterval: '',
          duration: ''
        }
      ]
    }));
  };

  const removePrescription = (index) => {
    if (recordData.prescriptions.length > 1) {
      setRecordData(prev => ({
        ...prev,
        prescriptions: prev.prescriptions.filter((_, i) => i !== index)
      }));
    }
  };

  const updatePrescription = (index, field, value) => {
    setRecordData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.map((prescription, i) =>
        i === index ? { ...prescription, [field]: value } : prescription
      )
    }));
  };

  const handleRecordSubmission = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add all record data
      Object.keys(recordData).forEach(key => {
        if (key === 'reportImages') {
          recordData.reportImages.forEach((file, index) => {
            formData.append(`reportImage_${index}`, file);
          });
        } else if (key === 'prescriptions') {
          formData.append('prescriptions', JSON.stringify(recordData.prescriptions));
        } else {
          formData.append(key, recordData[key]);
        }
      });

      // Add metadata
      formData.append('enteredBy', user.uid);
      formData.append('enteredAt', new Date().toISOString());
      formData.append('status', 'pending_verification');

      const response = await fetch('/api/medical-records', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setNotification({
          type: 'success',
          message: 'Medical record entered successfully! Doctor will be notified for verification.'
        });

        // Reset form
        setStep(1);
        setPatientVerified(false);
        setOtpSent(false);
        setOtpVerified(false);
        setPatientCredentials({ patientName: '', patientPassword: '', patientEmail: '' });
        setOtpCode('');
        setRecordData({
          patientName: '',
          doctorName: '',
          date: new Date().toISOString().split('T')[0],
          diagnosedDisease: '',
          reportImages: [],
          prescriptions: [
            {
              medicine: '',
              dosage: '',
              frequency: '',
              timeInterval: '',
              duration: ''
            }
          ],
          recommendations: '',
          caseStatus: 'stable',
          additionalNotes: ''
        });

        // Notify doctor about new record
        await notifyDoctor(recordData.doctorName, result.recordId);
        
      } else {
        throw new Error('Failed to submit medical record');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to submit medical record'
      });
    } finally {
      setLoading(false);
    }
  };

  const notifyDoctor = async (doctorName, recordId) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientType: 'doctor',
          recipientName: doctorName,
          type: 'new_record',
          title: 'New Medical Record for Verification',
          message: `A new medical record for ${recordData.patientName} has been entered and requires your verification.`,
          recordId: recordId,
          createdBy: user.uid
        })
      });
    } catch (error) {
      console.error('Failed to notify doctor:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {notification && (
          <NotificationBanner
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-2xl font-bold">Medical Record Entry</h1>
            <p className="mt-1 text-blue-100">
              {step === 1 ? 'Step 1: Patient Verification' : 'Step 2: Enter Medical Record'}
            </p>
          </div>

          {step === 1 && (
            <div className="p-6">
              <form onSubmit={handlePatientVerification} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={patientCredentials.patientName}
                      onChange={(e) => setPatientCredentials(prev => ({
                        ...prev,
                        patientName: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter patient's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={patientCredentials.patientEmail}
                      onChange={(e) => setPatientCredentials(prev => ({
                        ...prev,
                        patientEmail: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter patient's email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={patientCredentials.patientPassword}
                    onChange={(e) => setPatientCredentials(prev => ({
                      ...prev,
                      patientPassword: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter patient's password"
                  />
                </div>

                {!patientVerified && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Verify Patient & Send OTP
                  </button>
                )}
              </form>

              {otpSent && !otpVerified && (
                <form onSubmit={handleOTPVerification} className="mt-6 pt-6 border-t">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                    <p className="text-yellow-800">
                      OTP has been sent to patient's email. Please ask the patient to share the OTP code.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OTP Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    Verify OTP & Proceed
                  </button>
                </form>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="p-6">
              <form onSubmit={handleRecordSubmission} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      value={recordData.patientName}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor Name *
                    </label>
                    <select
                      required
                      value={recordData.doctorName}
                      onChange={(e) => setRecordData(prev => ({
                        ...prev,
                        doctorName: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.name}>
                          {doctor.name} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={recordData.date}
                      onChange={(e) => setRecordData(prev => ({
                        ...prev,
                        date: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnosed Disease *
                    </label>
                    <input
                      type="text"
                      required
                      value={recordData.diagnosedDisease}
                      onChange={(e) => setRecordData(prev => ({
                        ...prev,
                        diagnosedDisease: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter diagnosed disease"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {recordData.reportImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {recordData.reportImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Report ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Prescriptions *
                    </label>
                    <button
                      type="button"
                      onClick={addPrescription}
                      className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                    >
                      Add Prescription
                    </button>
                  </div>
                  
                  {recordData.prescriptions.map((prescription, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-700">Prescription {index + 1}</h4>
                        {recordData.prescriptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePrescription(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Medicine Name *</label>
                          <input
                            type="text"
                            required
                            value={prescription.medicine}
                            onChange={(e) => updatePrescription(index, 'medicine', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter medicine name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Dosage *</label>
                          <input
                            type="text"
                            required
                            value={prescription.dosage}
                            onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Frequency *</label>
                          <select
                            required
                            value={prescription.frequency}
                            onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select frequency</option>
                            <option value="1">Once daily</option>
                            <option value="2">Twice daily</option>
                            <option value="3">Thrice daily</option>
                            <option value="4">Four times daily</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Time Interval *</label>
                          <input
                            type="text"
                            required
                            value={prescription.timeInterval}
                            onChange={(e) => updatePrescription(index, 'timeInterval', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., After meals, Before sleep"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-1">Duration *</label>
                          <input
                            type="text"
                            required
                            value={prescription.duration}
                            onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 7 days, 2 weeks"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommendations to Patient *
                  </label>
                  <textarea
                    required
                    value={recordData.recommendations}
                    onChange={(e) => setRecordData(prev => ({
                      ...prev,
                      recommendations: e.target.value
                    }))}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter recommendations for the patient"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Status *
                  </label>
                  <select
                    required
                    value={recordData.caseStatus}
                    onChange={(e) => setRecordData(prev => ({
                      ...prev,
                      caseStatus: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="improving">Improving</option>
                    <option value="stable">Stable</option>
                    <option value="deteriorating">Deteriorating</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={recordData.additionalNotes}
                    onChange={(e) => setRecordData(prev => ({
                      ...prev,
                      additionalNotes: e.target.value
                    }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional notes or observations"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setPatientVerified(false);
                      setOtpSent(false);
                      setOtpVerified(false);
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Back to Patient Verification
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Submit Medical Record
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordEntry;