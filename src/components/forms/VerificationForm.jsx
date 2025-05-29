import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

const VerificationForm = ({ record, onVerify, onEdit, onClose, isOpen }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedRecord, setEditedRecord] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    if (record) {
      setEditedRecord({
        patientName: record.patientName || '',
        doctorName: record.doctorName || user?.name || '',
        date: record.date || new Date().toISOString().split('T')[0],
        diagnosedDisease: record.diagnosedDisease || '',
        reportImage: record.reportImage || null,
        prescription: record.prescription || '',
        dosage: record.dosage || '',
        recommendations: record.recommendations || '',
        caseStatus: record.caseStatus || 'stable'
      });
    }
  }, [record, user]);

  const handleInputChange = (field, value) => {
    setEditedRecord(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to Firebase Storage
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditedRecord(prev => ({
          ...prev,
          reportImage: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectVerification = async () => {
    setLoading(true);
    try {
      await onVerify({
        ...record,
        verifiedBy: user.uid,
        verifiedAt: new Date().toISOString(),
        verificationNotes,
        status: 'verified'
      });
      onClose();
    } catch (error) {
      console.error('Verification failed:', error);
      alert('Failed to verify record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAndVerify = async () => {
    setLoading(true);
    try {
      await onEdit({
        ...editedRecord,
        id: record.id,
        verifiedBy: user.uid,
        verifiedAt: new Date().toISOString(),
        verificationNotes,
        status: 'verified',
        editedBy: user.uid,
        editedAt: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      console.error('Edit and verification failed:', error);
      alert('Failed to edit and verify record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Record Verification - {record.patientName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Record Information Display/Edit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedRecord?.patientName || ''}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {record.patientName}
                </p>
              )}
            </div>

            {/* Doctor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedRecord?.doctorName || ''}
                  onChange={(e) => handleInputChange('doctorName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {record.doctorName}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedRecord?.date || ''}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {new Date(record.date).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Case Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Status
              </label>
              {isEditing ? (
                <select
                  value={editedRecord?.caseStatus || 'stable'}
                  onChange={(e) => handleInputChange('caseStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="improving">Improving</option>
                  <option value="stable">Stable</option>
                  <option value="deteriorating">Deteriorating</option>
                </select>
              ) : (
                <p className={`px-3 py-2 rounded-md capitalize ${
                  record.caseStatus === 'improving' ? 'bg-green-100 text-green-800' :
                  record.caseStatus === 'deteriorating' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {record.caseStatus}
                </p>
              )}
            </div>
          </div>

          {/* Diagnosed Disease */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosed Disease
            </label>
            {isEditing ? (
              <textarea
                value={editedRecord?.diagnosedDisease || ''}
                onChange={(e) => handleInputChange('diagnosedDisease', e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {record.diagnosedDisease}
              </p>
            )}
          </div>

          {/* Prescription */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prescription
            </label>
            {isEditing ? (
              <textarea
                value={editedRecord?.prescription || ''}
                onChange={(e) => handleInputChange('prescription', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {record.prescription}
              </p>
            )}
          </div>

          {/* Dosage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dosage Instructions
            </label>
            {isEditing ? (
              <textarea
                value={editedRecord?.dosage || ''}
                onChange={(e) => handleInputChange('dosage', e.target.value)}
                rows="2"
                placeholder="e.g., 2 tablets daily, morning and evening"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {record.dosage}
              </p>
            )}
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendations
            </label>
            {isEditing ? (
              <textarea
                value={editedRecord?.recommendations || ''}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {record.recommendations}
              </p>
            )}
          </div>

          {/* Report Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Image
            </label>
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            )}
            {(record.reportImage || editedRecord?.reportImage) && (
              <div className="mt-2">
                <img
                  src={isEditing ? editedRecord.reportImage : record.reportImage}
                  alt="Medical Report"
                  className="max-w-full h-48 object-contain border rounded-md"
                />
              </div>
            )}
          </div>

          {/* Verification Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Notes (Optional)
            </label>
            <textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              rows="2"
              placeholder="Add any notes about this verification..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {!isEditing ? (
              <>
                <button
                  onClick={handleDirectVerification}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <LoadingSpinner size="small" />}
                  Verify Record
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit & Verify
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditAndVerify}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <LoadingSpinner size="small" />}
                  Save & Verify
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel Edit
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;