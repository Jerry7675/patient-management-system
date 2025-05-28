import React, { useState, useRef } from 'react';

const RecordForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null,
  isEdit = false,
  doctors = [],
  patients = []
}) => {
  const [formData, setFormData] = useState({
    patientId: initialData?.patientId || '',
    patientName: initialData?.patientName || '',
    doctorId: initialData?.doctorId || '',
    doctorName: initialData?.doctorName || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    diagnosedDisease: initialData?.diagnosedDisease || '',
    symptoms: initialData?.symptoms || '',
    prescriptions: initialData?.prescriptions || [
      { medicine: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ],
    recommendations: initialData?.recommendations || '',
    caseStatus: initialData?.caseStatus || 'stable',
    reportImages: [],
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updatedPrescriptions = [...formData.prescriptions];
    updatedPrescriptions[index][field] = value;
    setFormData(prev => ({
      ...prev,
      prescriptions: updatedPrescriptions
    }));
  };

  const addPrescription = () => {
    setFormData(prev => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        { medicine: '', dosage: '', frequency: '', duration: '', instructions: '' }
      ]
    }));
  };

  const removePrescription = (index) => {
    if (formData.prescriptions.length > 1) {
      const updatedPrescriptions = formData.prescriptions.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        prescriptions: updatedPrescriptions
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({
        ...prev,
        reportImages: 'Some files were rejected. Only images under 5MB are allowed.'
      }));
    }

    setFormData(prev => ({
      ...prev,
      reportImages: [...prev.reportImages, ...validFiles]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      reportImages: prev.reportImages.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }

    if (!formData.doctorName.trim()) {
      newErrors.doctorName = 'Doctor name is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.diagnosedDisease.trim()) {
      newErrors.diagnosedDisease = 'Diagnosed disease is required';
    }

    // Validate prescriptions
    formData.prescriptions.forEach((prescription, index) => {
      if (prescription.medicine.trim() && !prescription.dosage.trim()) {
        newErrors[`prescription_${index}_dosage`] = 'Dosage is required when medicine is specified';
      }
      if (prescription.medicine.trim() && !prescription.frequency.trim()) {
        newErrors[`prescription_${index}_frequency`] = 'Frequency is required when medicine is specified';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Filter out empty prescriptions
      const validPrescriptions = formData.prescriptions.filter(p => 
        p.medicine.trim() || p.dosage.trim() || p.frequency.trim()
      );

      const submissionData = {
        ...formData,
        prescriptions: validPrescriptions,
        createdAt: new Date().toISOString(),
        status: 'pending_verification'
      };

      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to submit record. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Patient Record' : 'Add New Patient Record'}
        </h2>
        <p className="text-gray-600 mt-2">
          Fill in all the required information for the patient record
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient and Doctor Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient Name *
            </label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.patientName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter patient name"
            />
            {errors.patientName && (
              <p className="text-red-500 text-sm mt-1">{errors.patientName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor Name *
            </label>
            <input
              type="text"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.doctorName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter doctor name"
            />
            {errors.doctorName && (
              <p className="text-red-500 text-sm mt-1">{errors.doctorName}</p>
            )}
          </div>
        </div>

        {/* Date and Disease */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Status
            </label>
            <select
              name="caseStatus"
              value={formData.caseStatus}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="improving">Improving</option>
              <option value="stable">Stable</option>
              <option value="deteriorating">Deteriorating</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Diagnosed Disease */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diagnosed Disease *
          </label>
          <input
            type="text"
            name="diagnosedDisease"
            value={formData.diagnosedDisease}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.diagnosedDisease ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter diagnosed disease"
          />
          {errors.diagnosedDisease && (
            <p className="text-red-500 text-sm mt-1">{errors.diagnosedDisease}</p>
          )}
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symptoms
          </label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter observed symptoms"
          />
        </div>

        {/* Prescriptions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Prescriptions
            </label>
            <button
              type="button"
              onClick={addPrescription}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              Add Prescription
            </button>
          </div>

          {formData.prescriptions.map((prescription, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">Prescription {index + 1}</h4>
                {formData.prescriptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrescription(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Medicine
                  </label>
                  <input
                    type="text"
                    value={prescription.medicine}
                    onChange={(e) => handlePrescriptionChange(index, 'medicine', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Medicine name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={prescription.dosage}
                    onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors[`prescription_${index}_dosage`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 500mg"
                  />
                  {errors[`prescription_${index}_dosage`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`prescription_${index}_dosage`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Frequency
                  </label>
                  <input
                    type="text"
                    value={prescription.frequency}
                    onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors[`prescription_${index}_frequency`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 3 times a day"
                  />
                  {errors[`prescription_${index}_frequency`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`prescription_${index}_frequency`]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={prescription.duration}
                    onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 7 days"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Instructions
                  </label>
                  <input
                    type="text"
                    value={prescription.instructions}
                    onChange={(e) => handlePrescriptionChange(index, 'instructions', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., after meals"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Report Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Images
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />
            <div className="text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-blue-500"
              >
                Choose Images
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Upload medical reports, X-rays, or other relevant images (Max 5MB each)
              </p>
            </div>
            
            {formData.reportImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.reportImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Report ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
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
            
            {errors.reportImages && (
              <p className="text-red-500 text-sm mt-2">{errors.reportImages}</p>
            )}
          </div>
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
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter recommendations for the patient"
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional notes or observations"
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEdit ? 'Updating...' : 'Adding...'}
              </div>
            ) : (
              isEdit ? 'Update Record' : 'Add Record'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordForm;