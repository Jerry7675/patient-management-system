import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const VerifyRecords = () => {
  const { user } = useAuth();
  const [pendingRecords, setPendingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [processingId, setProcessingId] = useState(null);

  // Fetch pending records for verification
  useEffect(() => {
    fetchPendingRecords();
  }, [user]);

  const fetchPendingRecords = async () => {
    try {
      setLoading(true);
      const recordsRef = collection(db, 'medicalRecords');
      const q = query(recordsRef, where('status', '==', 'pending_verification'));
      
      const querySnapshot = await getDocs(q);
      const records = [];
      
      querySnapshot.forEach((doc) => {
        records.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setPendingRecords(records);
    } catch (error) {
      console.error('Error fetching pending records:', error);
      alert('Error loading pending records');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRecord = async (recordId) => {
    try {
      setProcessingId(recordId);
      
      // Update record status to verified
      const recordRef = doc(db, 'medicalRecords', recordId);
      await updateDoc(recordRef, {
        status: 'verified',
        verifiedBy: user.uid,
        verifiedAt: new Date(),
        doctorName: user.displayName || user.email
      });

      // Remove notification for this record
      await removeNotification(recordId);

      // Refresh the list
      await fetchPendingRecords();
      
      alert('Record verified successfully!');
    } catch (error) {
      console.error('Error verifying record:', error);
      alert('Error verifying record');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record.id);
    setEditForm({
      patientName: record.patientName || '',
      doctorName: record.doctorName || '',
      date: record.date || '',
      diagnosedDisease: record.diagnosedDisease || '',
      prescriptions: record.prescriptions || [
        { medicine: '', dosage: '', frequency: '', timing: '' }
      ],
      recommendations: record.recommendations || '',
      caseStatus: record.caseStatus || 'stable',
      reportImages: record.reportImages || []
    });
  };

  const handleSaveEdit = async () => {
    try {
      setProcessingId(editingRecord);
      
      const recordRef = doc(db, 'medicalRecords', editingRecord);
      await updateDoc(recordRef, {
        ...editForm,
        status: 'verified',
        verifiedBy: user.uid,
        verifiedAt: new Date(),
        doctorName: user.displayName || user.email,
        editedBy: user.uid,
        editedAt: new Date()
      });

      // Remove notification for this record
      await removeNotification(editingRecord);

      // Reset editing state
      setEditingRecord(null);
      setEditForm({});
      
      // Refresh the list
      await fetchPendingRecords();
      
      alert('Record updated and verified successfully!');
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Error updating record');
    } finally {
      setProcessingId(null);
    }
  };

  const removeNotification = async (recordId) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef, 
        where('recordId', '==', recordId),
        where('doctorId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(doc(db, 'notifications', docSnapshot.id));
      });
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updatedPrescriptions = [...editForm.prescriptions];
    updatedPrescriptions[index] = {
      ...updatedPrescriptions[index],
      [field]: value
    };
    setEditForm(prev => ({
      ...prev,
      prescriptions: updatedPrescriptions
    }));
  };

  const addPrescription = () => {
    setEditForm(prev => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        { medicine: '', dosage: '', frequency: '', timing: '' }
      ]
    }));
  };

  const removePrescription = (index) => {
    setEditForm(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Records</h1>
          <p className="text-gray-600">Review and verify medical records entered by management</p>
        </div>

        {pendingRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Pending Records</h2>
            <p className="text-gray-500">All records have been verified</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-lg shadow-md p-6">
                {editingRecord === record.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-blue-600">Editing Record</h3>
                      <div className="space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={processingId === record.id}
                          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                        >
                          {processingId === record.id ? 'Saving...' : 'Save & Verify'}
                        </button>
                        <button
                          onClick={() => setEditingRecord(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Patient Name
                        </label>
                        <input
                          type="text"
                          value={editForm.patientName}
                          onChange={(e) => handleInputChange('patientName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diagnosed Disease
                      </label>
                      <input
                        type="text"
                        value={editForm.diagnosedDisease}
                        onChange={(e) => handleInputChange('diagnosedDisease', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Prescriptions
                        </label>
                        <button
                          onClick={addPrescription}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                        >
                          Add Prescription
                        </button>
                      </div>
                      
                      {editForm.prescriptions.map((prescription, index) => (
                        <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <input
                              type="text"
                              placeholder="Medicine"
                              value={prescription.medicine}
                              onChange={(e) => handlePrescriptionChange(index, 'medicine', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Dosage"
                              value={prescription.dosage}
                              onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Frequency (e.g., 3 times a day)"
                              value={prescription.frequency}
                              onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                placeholder="Timing"
                                value={prescription.timing}
                                onChange={(e) => handlePrescriptionChange(index, 'timing', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {editForm.prescriptions.length > 1 && (
                                <button
                                  onClick={() => removePrescription(index)}
                                  className="bg-red-500 text-white px-2 py-2 rounded-md hover:bg-red-600"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recommendations
                      </label>
                      <textarea
                        value={editForm.recommendations}
                        onChange={(e) => handleInputChange('recommendations', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Case Status
                      </label>
                      <select
                        value={editForm.caseStatus}
                        onChange={(e) => handleInputChange('caseStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="improving">Improving</option>
                        <option value="stable">Stable</option>
                        <option value="deteriorating">Deteriorating</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Patient: {record.patientName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Entered on: {new Date(record.createdAt?.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleVerifyRecord(record.id)}
                          disabled={processingId === record.id}
                          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                        >
                          {processingId === record.id ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-gray-700">Date: </span>
                          <span className="text-gray-600">{record.date}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Diagnosed Disease: </span>
                          <span className="text-gray-600">{record.diagnosedDisease}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Case Status: </span>
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            record.caseStatus === 'improving' ? 'bg-green-100 text-green-800' :
                            record.caseStatus === 'deteriorating' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.caseStatus?.charAt(0).toUpperCase() + record.caseStatus?.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-gray-700">Entered by: </span>
                          <span className="text-gray-600">{record.enteredBy}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Management ID: </span>
                          <span className="text-gray-600">{record.managementId}</span>
                        </div>
                      </div>
                    </div>

                    {record.prescriptions && record.prescriptions.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700 mb-2">Prescriptions:</h4>
                        <div className="space-y-2">
                          {record.prescriptions.map((prescription, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                                <div><strong>Medicine:</strong> {prescription.medicine}</div>
                                <div><strong>Dosage:</strong> {prescription.dosage}</div>
                                <div><strong>Frequency:</strong> {prescription.frequency}</div>
                                <div><strong>Timing:</strong> {prescription.timing}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.recommendations && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700 mb-2">Recommendations:</h4>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                          {record.recommendations}
                        </p>
                      </div>
                    )}

                    {record.reportImages && record.reportImages.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700 mb-2">Report Images:</h4>
                        <div className="flex space-x-2">
                          {record.reportImages.map((imageUrl, index) => (
                            <img
                              key={index}
                              src={imageUrl}
                              alt={`Report ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-md border cursor-pointer"
                              onClick={() => window.open(imageUrl, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyRecords;