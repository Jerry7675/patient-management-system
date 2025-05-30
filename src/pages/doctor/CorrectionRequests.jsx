import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc,
  getDoc,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CorrectionRequests = () => {
  const { user } = useAuth();
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseForm, setResponseForm] = useState({
    status: '',
    responseMessage: '',
    correctedRecord: null
  });
  const [editingRecord, setEditingRecord] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Fetch correction requests in real-time
  useEffect(() => {
    if (!user?.uid) return;

    const requestsRef = collection(db, 'correctionRequests');
    const q = query(
      requestsRef,
      where('verifiedBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const requests = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const requestData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Fetch the original record details
        if (requestData.recordId) {
          try {
            const recordDoc = await getDoc(doc(db, 'medicalRecords', requestData.recordId));
            if (recordDoc.exists()) {
              requestData.originalRecord = { id: recordDoc.id, ...recordDoc.data() };
            }
          } catch (error) {
            console.error('Error fetching record:', error);
          }
        }
        
        requests.push(requestData);
      }
      
      setCorrectionRequests(requests);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching correction requests:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter requests based on selected filter
  const filteredRequests = correctionRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setResponseForm({
      status: '',
      responseMessage: '',
      correctedRecord: request.originalRecord ? { ...request.originalRecord } : null
    });
  };

  const handleApproveRequest = async (requestId, withCorrection = false) => {
    try {
      setProcessingId(requestId);
      
      const requestRef = doc(db, 'correctionRequests', requestId);
      const updateData = {
        status: 'approved',
        responseMessage: responseForm.responseMessage,
        respondedAt: new Date(),
        respondedBy: user.uid
      };

      // If correction is being made, update the original record
      if (withCorrection && responseForm.correctedRecord) {
        const recordRef = doc(db, 'medicalRecords', selectedRequest.recordId);
        await updateDoc(recordRef, {
          ...responseForm.correctedRecord,
          lastModifiedAt: new Date(),
          lastModifiedBy: user.uid,
          correctionApplied: true,
          correctionRequestId: requestId
        });
        updateData.correctionApplied = true;
      }

      await updateDoc(requestRef, updateData);

      // Send notification to patient
      await addDoc(collection(db, 'notifications'), {
        userId: selectedRequest.patientId,
        type: 'correction_response',
        title: 'Correction Request Approved',
        message: withCorrection 
          ? 'Your correction request has been approved and the record has been updated.'
          : 'Your correction request has been approved.',
        correctionRequestId: requestId,
        read: false,
        createdAt: new Date()
      });

      setSelectedRequest(null);
      alert('Correction request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error processing request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!responseForm.responseMessage.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingId(requestId);
      
      const requestRef = doc(db, 'correctionRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        responseMessage: responseForm.responseMessage,
        respondedAt: new Date(),
        respondedBy: user.uid
      });

      // Send notification to patient
      await addDoc(collection(db, 'notifications'), {
        userId: selectedRequest.patientId,
        type: 'correction_response',
        title: 'Correction Request Rejected',
        message: `Your correction request has been rejected. Reason: ${responseForm.responseMessage}`,
        correctionRequestId: requestId,
        read: false,
        createdAt: new Date()
      });

      setSelectedRequest(null);
      alert('Correction request rejected.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error processing request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRecordFieldChange = (field, value) => {
    setResponseForm(prev => ({
      ...prev,
      correctedRecord: {
        ...prev.correctedRecord,
        [field]: value
      }
    }));
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updatedPrescriptions = [...(responseForm.correctedRecord.prescriptions || [])];
    updatedPrescriptions[index] = {
      ...updatedPrescriptions[index],
      [field]: value
    };
    setResponseForm(prev => ({
      ...prev,
      correctedRecord: {
        ...prev.correctedRecord,
        prescriptions: updatedPrescriptions
      }
    }));
  };

  const addPrescription = () => {
    const newPrescriptions = [
      ...(responseForm.correctedRecord.prescriptions || []),
      { medicine: '', dosage: '', frequency: '', timing: '' }
    ];
    setResponseForm(prev => ({
      ...prev,
      correctedRecord: {
        ...prev.correctedRecord,
        prescriptions: newPrescriptions
      }
    }));
  };

  const removePrescription = (index) => {
    const updatedPrescriptions = responseForm.correctedRecord.prescriptions.filter((_, i) => i !== index);
    setResponseForm(prev => ({
      ...prev,
      correctedRecord: {
        ...prev.correctedRecord,
        prescriptions: updatedPrescriptions
      }
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Correction Requests</h1>
          <p className="text-gray-600">Review and respond to patient correction requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'pending', label: 'Pending', count: correctionRequests.filter(r => r.status === 'pending').length },
              { key: 'approved', label: 'Approved', count: correctionRequests.filter(r => r.status === 'approved').length },
              { key: 'rejected', label: 'Rejected', count: correctionRequests.filter(r => r.status === 'rejected').length },
              { key: 'all', label: 'All Requests', count: correctionRequests.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  filter === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List or Detail View */}
        {selectedRequest ? (
          // Detail View
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Correction Request Details
                </h2>
                <p className="text-gray-600">Patient: {selectedRequest.patientName}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Back to List
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Request Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Request Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Status: </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status?.charAt(0).toUpperCase() + selectedRequest.status?.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Priority: </span>
                      <span className={getPriorityColor(selectedRequest.priority)}>
                        {selectedRequest.priority?.charAt(0).toUpperCase() + selectedRequest.priority?.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Submitted: </span>
                      <span>{new Date(selectedRequest.createdAt?.toDate()).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Category: </span>
                      <span>{selectedRequest.category}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-3">Patient's Correction Request</h3>
                  <p className="text-red-700 text-sm leading-relaxed">
                    {selectedRequest.reason}
                  </p>
                  {selectedRequest.specificField && (
                    <div className="mt-3 pt-3 border-t border-red-300">
                      <span className="font-medium text-red-800">Field to correct: </span>
                      <span className="text-red-700">{selectedRequest.specificField}</span>
                    </div>
                  )}
                  {selectedRequest.suggestedCorrection && (
                    <div className="mt-2">
                      <span className="font-medium text-red-800">Suggested correction: </span>
                      <span className="text-red-700">{selectedRequest.suggestedCorrection}</span>
                    </div>
                  )}
                </div>

                {/* Response Form */}
                {selectedRequest.status === 'pending' && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-3">Your Response</h3>
                    <textarea
                      value={responseForm.responseMessage}
                      onChange={(e) => setResponseForm(prev => ({ ...prev, responseMessage: e.target.value }))}
                      placeholder="Provide your response or reason for rejection..."
                      rows={4}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={() => handleApproveRequest(selectedRequest.id, false)}
                        disabled={processingId === selectedRequest.id}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                      >
                        {processingId === selectedRequest.id ? 'Processing...' : 'Approve (No Changes)'}
                      </button>
                      
                      <button
                        onClick={() => handleApproveRequest(selectedRequest.id, true)}
                        disabled={processingId === selectedRequest.id}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                      >
                        {processingId === selectedRequest.id ? 'Processing...' : 'Approve & Apply Correction'}
                      </button>
                      
                      <button
                        onClick={() => handleRejectRequest(selectedRequest.id)}
                        disabled={processingId === selectedRequest.id}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
                      >
                        {processingId === selectedRequest.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Previous Response */}
                {selectedRequest.status !== 'pending' && selectedRequest.responseMessage && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3">Your Response</h3>
                    <p className="text-gray-700 text-sm">{selectedRequest.responseMessage}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Responded on: {new Date(selectedRequest.respondedAt?.toDate()).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Original Record & Correction Form */}
              <div className="space-y-6">
                {selectedRequest.originalRecord && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">Original Record</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Date:</span> {selectedRequest.originalRecord.date}</div>
                      <div><span className="font-medium">Disease:</span> {selectedRequest.originalRecord.diagnosedDisease}</div>
                      <div><span className="font-medium">Recommendations:</span> {selectedRequest.originalRecord.recommendations}</div>
                      <div><span className="font-medium">Case Status:</span> {selectedRequest.originalRecord.caseStatus}</div>
                    </div>

                    {selectedRequest.originalRecord.prescriptions && (
                      <div className="mt-3">
                        <span className="font-medium">Prescriptions:</span>
                        <div className="mt-1 space-y-1">
                          {selectedRequest.originalRecord.prescriptions.map((prescription, index) => (
                            <div key={index} className="text-xs bg-white p-2 rounded">
                              {prescription.medicine} - {prescription.dosage} - {prescription.frequency}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Editable Record (for corrections) */}
                {selectedRequest.status === 'pending' && responseForm.correctedRecord && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-3">Make Corrections</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={responseForm.correctedRecord.date || ''}
                          onChange={(e) => handleRecordFieldChange('date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosed Disease</label>
                        <input
                          type="text"
                          value={responseForm.correctedRecord.diagnosedDisease || ''}
                          onChange={(e) => handleRecordFieldChange('diagnosedDisease', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                        <textarea
                          value={responseForm.correctedRecord.recommendations || ''}
                          onChange={(e) => handleRecordFieldChange('recommendations', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Case Status</label>
                        <select
                          value={responseForm.correctedRecord.caseStatus || ''}
                          onChange={(e) => handleRecordFieldChange('caseStatus', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="improving">Improving</option>
                          <option value="stable">Stable</option>
                          <option value="deteriorating">Deteriorating</option>
                        </select>
                      </div>

                      {/* Prescriptions Editor */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">Prescriptions</label>
                          <button
                            onClick={addPrescription}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                          >
                            Add
                          </button>
                        </div>
                        
                        {responseForm.correctedRecord.prescriptions?.map((prescription, index) => (
                          <div key={index} className="border border-gray-200 rounded p-3 mb-2 bg-white">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <input
                                type="text"
                                placeholder="Medicine"
                                value={prescription.medicine}
                                onChange={(e) => handlePrescriptionChange(index, 'medicine', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Dosage"
                                value={prescription.dosage}
                                onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Frequency"
                                value={prescription.frequency}
                                onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="flex space-x-1">
                                <input
                                  type="text"
                                  placeholder="Timing"
                                  value={prescription.timing}
                                  onChange={(e) => handlePrescriptionChange(index, 'timing', e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                {responseForm.correctedRecord.prescriptions.length > 1 && (
                                  <button
                                    onClick={() => removePrescription(index)}
                                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // List View
          <div>
            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">✏️</div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  No {filter !== 'all' ? filter : ''} Correction Requests
                </h2>
                <p className="text-gray-500">
                  {filter === 'pending' 
                    ? 'No pending correction requests to review.'
                    : 'No correction requests found.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleViewRequest(request)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {request.patientName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                            {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                          </span>
                          <span className={`text-sm font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority?.charAt(0).toUpperCase() + request.priority?.slice(1)} Priority
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {request.reason}
                        </p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>Category: {request.category}</span>
                          <span>Submitted: {new Date(request.createdAt?.toDate()).toLocaleDateString()}</span>
                          {request.specificField && (
                            <span>Field: {request.specificField}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewRequest(request);
                          }}
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrectionRequests;