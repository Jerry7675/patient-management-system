import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, Send, FileText, Clock, CheckCircle, XCircle, User, Calendar } from 'lucide-react';

const RequestCorrection = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState('');
  const [formData, setFormData] = useState({
    fieldToCorrect: '',
    correctionReason: '',
    proposedCorrection: '',
    priority: 'medium'
  });

  const correctionFields = [
    { value: 'diagnosedDisease', label: 'Diagnosed Disease' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'dosage', label: 'Dosage Instructions' },
    { value: 'recommendations', label: 'Doctor Recommendations' },
    { value: 'caseStatus', label: 'Case Status' },
    { value: 'date', label: 'Record Date' },
    { value: 'other', label: 'Other (specify in reason)' }
  ];

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch patient's verified records
      const recordsQuery = query(
        collection(db, 'records'),
        where('patientId', '==', user.uid),
        where('isVerified', '==', true),
        orderBy('date', 'desc')
      );
      
      const recordsSnapshot = await getDocs(recordsQuery);
      const recordsData = [];
      
      for (const docSnapshot of recordsSnapshot.docs) {
        const recordData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Fetch doctor details
        if (recordData.doctorId) {
          const doctorQuery = query(
            collection(db, 'users'),
            where('uid', '==', recordData.doctorId)
          );
          const doctorSnapshot = await getDocs(doctorQuery);
          
          if (!doctorSnapshot.empty) {
            recordData.doctorName = doctorSnapshot.docs[0].data().fullName;
          }
        }
        
        recordsData.push(recordData);
      }
      
      setRecords(recordsData);

      // Fetch existing correction requests
      const requestsQuery = query(
        collection(db, 'correctionRequests'),
        where('patientId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const requestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCorrectionRequests(requestsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRecord || !formData.fieldToCorrect || !formData.correctionReason.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    // Check if there's already a pending request for this record
    const existingRequest = correctionRequests.find(
      req => req.recordId === selectedRecord && req.status === 'pending'
    );
    
    if (existingRequest) {
      alert('You already have a pending correction request for this record.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedRecordData = records.find(r => r.id === selectedRecord);
      
      // Create correction request
      await addDoc(collection(db, 'correctionRequests'), {
        patientId: user.uid,
        recordId: selectedRecord,
        doctorId: selectedRecordData.doctorId,
        fieldToCorrect: formData.fieldToCorrect,
        correctionReason: formData.correctionReason,
        proposedCorrection: formData.proposedCorrection,
        priority: formData.priority,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create notification for doctor
      await addDoc(collection(db, 'notifications'), {
        userId: selectedRecordData.doctorId,
        type: 'correction_request',
        title: 'New Correction Request',
        message: `${user.displayName || user.email} has requested a correction for a medical record.`,
        recordId: selectedRecord,
        isRead: false,
        createdAt: serverTimestamp(),
        priority: formData.priority
      });

      // Reset form
      setSelectedRecord('');
      setFormData({
        fieldToCorrect: '',
        correctionReason: '',
        proposedCorrection: '',
        priority: 'medium'
      });

      // Refresh data
      await fetchData();
      
      alert('Correction request submitted successfully! The doctor will be notified.');
    } catch (error) {
      console.error('Error submitting correction request:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Request Record Correction
          </h1>
          <p className="text-gray-600 mt-1">
            Submit a request to correct information in your medical records
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Correction Request Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Correction Request</h2>
            
            {records.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No verified records available for correction requests.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Select Record */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Record to Correct <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedRecord}
                    onChange={(e) => setSelectedRecord(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose a record...</option>
                    {records.map((record) => (
                      <option key={record.id} value={record.id}>
                        {formatDate(record.date)} - {record.diagnosedDisease} (Dr. {record.doctorName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field to Correct */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field to Correct <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.fieldToCorrect}
                    onChange={(e) => setFormData({ ...formData, fieldToCorrect: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select field to correct...</option>
                    {correctionFields.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Correction Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Correction <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.correctionReason}
                    onChange={(e) => setFormData({ ...formData, correctionReason: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Explain why this correction is needed..."
                    required
                  />
                </div>

                {/* Proposed Correction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Correction (Optional)
                  </label>
                  <textarea
                    value={formData.proposedCorrection}
                    onChange={(e) => setFormData({ ...formData, proposedCorrection: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="What should the correct information be?"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low - Minor correction</option>
                    <option value="medium">Medium - Moderate importance</option>
                    <option value="high">High - Urgent correction needed</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Previous Requests */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Correction Requests</h2>
            
            {correctionRequests.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No correction requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {correctionRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(request.createdAt)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <p><strong>Field:</strong> {correctionFields.find(f => f.value === request.fieldToCorrect)?.label}</p>
                      <p><strong>Reason:</strong> {request.correctionReason}</p>
                      {request.proposedCorrection && (
                        <p><strong>Proposed Fix:</strong> {request.proposedCorrection}</p>
                      )}
                      {request.doctorResponse && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <p className="text-xs font-medium text-gray-700">Doctor Response:</p>
                          <p className="text-xs text-gray-600">{request.doctorResponse}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestCorrection;