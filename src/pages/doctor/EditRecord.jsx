import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../services/firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditRecord = () => {
  const [recordId, setRecordId] = useState('record123'); // In real app, get from URL params
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState(null);
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    date: '',
    diagnosedDisease: '',
    doctorPrescriptions: '',
    prescriptionDose: '',
    recommendations: '',
    caseStatus: 'stable',
    reportImages: []
  });
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock user for demonstration
  const user = { uid: 'doctor123', name: 'Dr. Smith' };

  useEffect(() => {
    fetchRecord();
  }, [recordId]);

  const fetchRecord = async () => {
    try {
      // Mock data for demonstration
      const mockRecord = {
        patientName: 'John Doe',
        doctorName: 'Dr. Smith',
        date: '2024-01-15',
        diagnosedDisease: 'Common Cold',
        doctorPrescriptions: 'Paracetamol 500mg',
        prescriptionDose: '2 tablets twice daily after meals',
        recommendations: 'Rest and drink plenty of fluids',
        caseStatus: 'improving',
        reportImages: []
      };
      
      setRecord(mockRecord);
      setFormData(mockRecord);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch record: ' + err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.reportImages.length + newImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setNewImages(prev => [...prev, ...files]);
    setError('');
  };

  const removeExistingImage = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      reportImages: prev.reportImages.filter(img => img !== imageUrl)
    }));
    setImagesToDelete(prev => [...prev, imageUrl]);
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadNewImages = async () => {
    // Mock upload for demonstration
    return newImages.map((file, index) => `mock-url-${index}-${file.name}`);
  };

  const deleteRemovedImages = async () => {
    // Mock deletion for demonstration
    console.log('Deleting images:', imagesToDelete);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.diagnosedDisease.trim() || !formData.doctorPrescriptions.trim()) {
        throw new Error('Diagnosed disease and prescriptions are required');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess('Record updated successfully');
      
    } catch (err) {
      setError('Failed to update record: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyAfterEdit = async () => {
    setSaving(true);
    try {
      // Validate required fields
      if (!formData.diagnosedDisease.trim() || !formData.doctorPrescriptions.trim()) {
        throw new Error('Diagnosed disease and prescriptions are required');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess('Record updated and verified successfully');
      
    } catch (err) {
      setError('Failed to update and verify record: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    // In real app, this would navigate back
    console.log('Navigate back to verify records');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit Medical Record</h1>
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              ← Back to Records
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="space-y-6">
            {/* Patient and Doctor Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Name
                </label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Diagnosed Disease */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosed Disease *
              </label>
              <textarea
                name="diagnosedDisease"
                value={formData.diagnosedDisease}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the diagnosed disease or condition"
                required
              />
            </div>

            {/* Doctor Prescriptions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Prescriptions *
              </label>
              <textarea
                name="doctorPrescriptions"
                value={formData.doctorPrescriptions}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter prescribed medications"
                required
              />
            </div>

            {/* Prescription Dosage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescription Dosage & Instructions
              </label>
              <textarea
                name="prescriptionDose"
                value={formData.prescriptionDose}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2 tablets daily after meals, morning and evening"
              />
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendations
              </label>
              <textarea
                name="recommendations"
                value={formData.recommendations}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter recommendations for the patient"
              />
            </div>

            {/* Case Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Status
              </label>
              <select
                name="caseStatus"
                value={formData.caseStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="improving">Improving</option>
                <option value="stable">Stable</option>
                <option value="deteriorating">Deteriorating</option>
                <option value="critical">Critical</option>
                <option value="recovered">Recovered</option>
              </select>
            </div>

            {/* Report Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Images
              </label>
              
              {/* Existing Images */}
              {formData.reportImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Current Images:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.reportImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Report ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(imageUrl)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {newImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">New Images:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New report ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border border-green-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Input */}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload report images (Max 5 images, JPG/PNG only)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button
                onClick={handleVerifyAfterEdit}
                disabled={saving}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Processing...' : 'Save & Verify'}
              </button>
              
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Record Status Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Record Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Record ID:</span> {recordId}
              </div>
              <div>
                <span className="font-medium">Current Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  record?.status === 'verified' ? 'bg-green-100 text-green-800' :
                  record?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {record?.status || 'Draft'}
                </span>
              </div>
              <div>
                <span className="font-medium">Last Modified:</span> {new Date().toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Doctor:</span> {user.name}
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Editing Guidelines</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Required fields: Diagnosed Disease and Doctor Prescriptions</li>
              <li>• Be specific with prescription dosages and timing</li>
              <li>• Use clear language for patient recommendations</li>
              <li>• Select appropriate case status to track patient progress</li>
              <li>• Upload clear, relevant medical report images</li>
              <li>• Save & Verify to complete the record in one step</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRecord;