import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  FileText, 
  Calendar, 
  User, 
  Stethoscope,
  Camera,
  X,
  Send,
  CheckCircle,
  Clock,
  Upload
} from 'lucide-react';

const CorrectionRequestForm = ({ 
  record, 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    correctionType: '',
    fieldToCorrect: '',
    currentValue: '',
    requestedValue: '',
    reason: '',
    supportingDocuments: [],
    urgency: 'normal',
    contactMethod: 'email'
  });
  
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(''); // 'success', 'error', ''

  const correctionTypes = [
    { value: 'personal_info', label: 'Personal Information' },
    { value: 'diagnosis', label: 'Diagnosis Information' },
    { value: 'prescription', label: 'Prescription Details' },
    { value: 'recommendations', label: 'Doctor Recommendations' },
    { value: 'case_status', label: 'Case Status/Progress' },
    { value: 'report_images', label: 'Medical Reports/Images' },
    { value: 'other', label: 'Other' }
  ];

  const fieldOptions = {
    personal_info: [
      { value: 'patient_name', label: 'Patient Name' },
      { value: 'date_of_birth', label: 'Date of Birth' },
      { value: 'contact_info', label: 'Contact Information' },
      { value: 'address', label: 'Address' }
    ],
    diagnosis: [
      { value: 'diagnosed_disease', label: 'Diagnosed Disease' },
      { value: 'diagnosis_date', label: 'Diagnosis Date' },
      { value: 'symptoms', label: 'Symptoms' },
      { value: 'severity', label: 'Severity Level' }
    ],
    prescription: [
      { value: 'medication_name', label: 'Medication Name' },
      { value: 'dosage', label: 'Dosage' },
      { value: 'frequency', label: 'Frequency/Timing' },
      { value: 'duration', label: 'Duration' },
      { value: 'instructions', label: 'Special Instructions' }
    ],
    recommendations: [
      { value: 'lifestyle_changes', label: 'Lifestyle Changes' },
      { value: 'diet_recommendations', label: 'Diet Recommendations' },
      { value: 'exercise_guidelines', label: 'Exercise Guidelines' },
      { value: 'follow_up_schedule', label: 'Follow-up Schedule' }
    ],
    case_status: [
      { value: 'progress_status', label: 'Progress Status (Improving/Deteriorating)' },
      { value: 'recovery_timeline', label: 'Recovery Timeline' },
      { value: 'prognosis', label: 'Prognosis' }
    ],
    report_images: [
      { value: 'lab_reports', label: 'Laboratory Reports' },
      { value: 'xray_images', label: 'X-Ray Images' },
      { value: 'scan_results', label: 'Scan Results' },
      { value: 'other_reports', label: 'Other Medical Reports' }
    ],
    other: [
      { value: 'custom_field', label: 'Please specify in reason section' }
    ]
  };

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', color: 'text-green-600', desc: 'Can wait for next appointment' },
    { value: 'normal', label: 'Normal Priority', color: 'text-blue-600', desc: 'Standard processing time' },
    { value: 'high', label: 'High Priority', color: 'text-orange-600', desc: 'Needs attention soon' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600', desc: 'Immediate attention required' }
  ];

  useEffect(() => {
    if (record && isOpen) {
      // Auto-populate current values based on record
      setFormData(prev => ({
        ...prev,
        currentValue: getRecordFieldValue(record, prev.fieldToCorrect)
      }));
    }
  }, [record, formData.fieldToCorrect, isOpen]);

  const getRecordFieldValue = (record, field) => {
    const fieldMap = {
      'patient_name': record?.patientName,
      'diagnosed_disease': record?.diagnosedDisease,
      'diagnosis_date': record?.date,
      'medication_name': record?.prescription?.medication,
      'dosage': record?.prescription?.dosage,
      'frequency': record?.prescription?.frequency,
      'progress_status': record?.caseStatus,
      // Add more field mappings as needed
    };
    return fieldMap[field] || '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.correctionType) {
      newErrors.correctionType = 'Please select what type of information needs correction';
    }

    if (!formData.fieldToCorrect) {
      newErrors.fieldToCorrect = 'Please specify which field needs correction';
    }

    if (!formData.requestedValue.trim()) {
      newErrors.requestedValue = 'Please provide the correct information';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please explain why this correction is needed';
    }

    if (formData.reason.trim().length < 20) {
      newErrors.reason = 'Please provide a more detailed explanation (minimum 20 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Reset field selection when correction type changes
    if (field === 'correctionType') {
      setFormData(prev => ({ ...prev, fieldToCorrect: '', currentValue: '', requestedValue: '' }));
    }
  };

  const handleFileUpload = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    setFormData(prev => ({
      ...prev,
      supportingDocuments: [...prev.supportingDocuments, ...validFiles]
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      supportingDocuments: prev.supportingDocuments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit({
        ...formData,
        recordId: record.id,
        patientId: record.patientId,
        doctorId: record.doctorId,
        submittedAt: new Date().toISOString()
      });
      
      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error submitting correction request:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      correctionType: '',
      fieldToCorrect: '',
      currentValue: '',
      requestedValue: '',
      reason: '',
      supportingDocuments: [],
      urgency: 'normal',
      contactMethod: 'email'
    });
    setErrors({});
    setSubmitStatus('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Request Record Correction
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Request changes to your medical record from {record?.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Record Info */}
        <div className="p-6 bg-blue-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-gray-600">Patient:</span>
              <span className="ml-1 font-medium">{record?.patientName}</span>
            </div>
            <div className="flex items-center">
              <Stethoscope className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-gray-600">Doctor:</span>
              <span className="ml-1 font-medium">{record?.doctorName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-gray-600">Date:</span>
              <span className="ml-1 font-medium">{record?.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {submitStatus === 'success' && (
          <div className="p-4 bg-green-50 border-l-4 border-green-400 m-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-800">Correction request submitted successfully! The doctor will review your request.</span>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400 m-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-800">Failed to submit correction request. Please try again.</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Correction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What type of information needs correction? *
            </label>
            <select
              value={formData.correctionType}
              onChange={(e) => handleInputChange('correctionType', e.target.value)}
              className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.correctionType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select correction type...</option>
              {correctionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.correctionType && (
              <p className="text-red-600 text-sm mt-1">{errors.correctionType}</p>
            )}
          </div>

          {/* Specific Field */}
          {formData.correctionType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which specific field needs correction? *
              </label>
              <select
                value={formData.fieldToCorrect}
                onChange={(e) => handleInputChange('fieldToCorrect', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.fieldToCorrect ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select field...</option>
                {fieldOptions[formData.correctionType]?.map(field => (
                  <option key={field.value} value={field.value}>{field.label}</option>
                ))}
              </select>
              {errors.fieldToCorrect && (
                <p className="text-red-600 text-sm mt-1">{errors.fieldToCorrect}</p>
              )}
            </div>
          )}

          {/* Current vs Requested Values */}
          {formData.fieldToCorrect && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Information (in record)
                </label>
                <textarea
                  value={formData.currentValue}
                  onChange={(e) => handleInputChange('currentValue', e.target.value)}
                  placeholder="What the record currently shows..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Information *
                </label>
                <textarea
                  value={formData.requestedValue}
                  onChange={(e) => handleInputChange('requestedValue', e.target.value)}
                  placeholder="What it should be..."
                  rows={3}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.requestedValue ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.requestedValue && (
                  <p className="text-red-600 text-sm mt-1">{errors.requestedValue}</p>
                )}
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Correction Request *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Please explain why this correction is needed. Include any relevant details that support your request..."
              rows={4}
              className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.reason ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.reason && (
                <p className="text-red-600 text-sm">{errors.reason}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {formData.reason.length}/500 characters
              </p>
            </div>
          </div>

          {/* Supporting Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Documents (Optional)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload any supporting documents (medical reports, lab results, etc.)
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Drag & drop files here, or click to select
              </p>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Camera className="w-4 h-4 mr-2" />
                Choose Files
              </label>
            </div>

            {/* Uploaded Files */}
            {formData.supportingDocuments.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.supportingDocuments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priority Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {urgencyLevels.map(level => (
                <label key={level.value} className="relative">
                  <input
                    type="radio"
                    name="urgency"
                    value={level.value}
                    checked={formData.urgency === level.value}
                    onChange={(e) => handleInputChange('urgency', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.urgency === level.value
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className={`font-medium text-sm ${level.color}`}>
                      {level.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {level.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Contact Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Contact Method for Updates
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contactMethod"
                  value="email"
                  checked={formData.contactMethod === 'email'}
                  onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contactMethod"
                  value="phone"
                  checked={formData.contactMethod === 'phone'}
                  onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Phone</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || submitStatus === 'success'}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CorrectionRequestForm;