import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  Stethoscope, 
  FileText, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Edit3,
  Image,
  Pill,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  Search,
  Filter,
  Eye,
  UserCheck,
  MessageCircle,
  Save,
  X
} from 'lucide-react';

const DoctorDashboard = () => {
  const { currentUser, userData } = useAuth();
  const [pendingRecords, setPendingRecords] = useState([]);
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [verifiedRecords, setVerifiedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Form states for editing
  const [editForm, setEditForm] = useState({
    diagnosedDisease: '',
    prescriptions: [],
    recommendations: '',
    caseStatus: 'stable'
  });

  useEffect(() => {
    if (!currentUser || !userData) return;

    const fetchData = async () => {
      try {
        // Fetch pending records
        const pendingQuery = query(
          collection(db, 'medicalRecords'),
          where('doctorId', '==', currentUser.uid),
          where('verified', '==', false),
          orderBy('createdAt', 'desc')
        );

        const pendingUnsubscribe = onSnapshot(pendingQuery, (snapshot) => {
          const pendingData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setPendingRecords(pendingData);
        });

        // Fetch correction requests
        const correctionQuery = query(
          collection(db, 'correctionRequests'),
          where('doctorId', '==', currentUser.uid),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc')
        );

        const correctionUnsubscribe = onSnapshot(correctionQuery, (snapshot) => {
          const correctionData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCorrectionRequests(correctionData);
        });

        // Fetch verified records
        const verifiedQuery = query(
          collection(db, 'medicalRecords'),
          where('doctorId', '==', currentUser.uid),
          where('verified', '==', true),
          orderBy('verifiedAt', 'desc')
        );

        const verifiedUnsubscribe = onSnapshot(verifiedQuery, (snapshot) => {
          const verifiedData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setVerifiedRecords(verifiedData);
        });

        setLoading(false);

        return () => {
          pendingUnsubscribe();
          correctionUnsubscribe();
          verifiedUnsubscribe();
        };
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, userData]);

  const handleVerifyRecord = async (recordId, recordData) => {
    try {
      const recordRef = doc(db, 'medicalRecords', recordId);
      await updateDoc(recordRef, {
        verified: true,
        verifiedAt: serverTimestamp(),
        verifiedBy: currentUser.uid
      });

      // Create notification for patient
      await addDoc(collection(db, 'notifications'), {
        type: 'record_verified',
        recipientId: recordData.patientId,
        recipientType: 'patient',
        message: `Your medical record has been verified by Dr. ${userData.name}`,
        recordId: recordId,
        createdAt: serverTimestamp(),
        read: false
      });

      alert('Record verified successfully!');
    } catch (error) {
      console.error('Error verifying record:', error);
      alert('Failed to verify record. Please try again.');
    }
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setEditForm({
      diagnosedDisease: record.diagnosedDisease || '',
      prescriptions: record.prescriptions || [],
      recommendations: record.recommendations || '',
      caseStatus: record.caseStatus || 'stable'
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;

    try {
      const recordRef = doc(db, 'medicalRecords', editingRecord.id);
      await updateDoc(recordRef, {
        ...editForm,
        lastModified: serverTimestamp(),
        modifiedBy: currentUser.uid
      });

      // Create notification for patient
      await addDoc(collection(db, 'notifications'), {
        type: 'record_updated',
        recipientId: editingRecord.patientId,
        recipientType: 'patient',
        message: `Your medical record has been updated by Dr. ${userData.name}`,
        recordId: editingRecord.id,
        createdAt: serverTimestamp(),
        read: false
      });

      setEditingRecord(null);
      alert('Record updated successfully!');
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record. Please try again.');
    }
  };

  const handleVerifyAndEdit = async (recordId) => {
    try {
      const recordRef = doc(db, 'medicalRecords', recordId);
      await updateDoc(recordRef, {
        ...editForm,
        verified: true,
        verifiedAt: serverTimestamp(),
        verifiedBy: currentUser.uid
      });

      // Create notification for patient
      const record = pendingRecords.find(r => r.id === recordId);
      await addDoc(collection(db, 'notifications'), {
        type: 'record_verified',
        recipientId: record.patientId,
        recipientType: 'patient',
        message: `Your medical record has been verified and updated by Dr. ${userData.name}`,
        recordId: recordId,
        createdAt: serverTimestamp(),
        read: false
      });

      setEditingRecord(null);
      alert('Record verified and updated successfully!');
    } catch (error) {
      console.error('Error verifying and updating record:', error);
      alert('Failed to verify and update record. Please try again.');
    }
  };

  const handleCorrectionRequest = async (requestId, action, response = '') => {
    try {
      const requestRef = doc(db, 'correctionRequests', requestId);
      
      if (action === 'approve') {
        await updateDoc(requestRef, {
          status: 'approved',
          response: response,
          resolvedAt: serverTimestamp(),
          resolvedBy: currentUser.uid
        });

        // Remove correction flag from record
        const request = correctionRequests.find(r => r.id === requestId);
        const recordRef = doc(db, 'medicalRecords', request.recordId);
        await updateDoc(recordRef, {
          correctionRequested: false
        });

        // Create notification for patient
        await addDoc(collection(db, 'notifications'), {
          type: 'correction_approved',
          recipientId: request.patientId,
          recipientType: 'patient',
          message: `Your correction request has been approved by Dr. ${userData.name}`,
          recordId: request.recordId,
          createdAt: serverTimestamp(),
          read: false
        });
      } else {
        await updateDoc(requestRef, {
          status: 'rejected',
          response: response,
          resolvedAt: serverTimestamp(),
          resolvedBy: currentUser.uid
        });

        // Remove correction flag from record
        const request = correctionRequests.find(r => r.id === requestId);
        const recordRef = doc(db, 'medicalRecords', request.recordId);
        await updateDoc(recordRef, {
          correctionRequested: false
        });

        // Create notification for patient
        await addDoc(collection(db, 'notifications'), {
          type: 'correction_rejected',
          recipientId: request.patientId,
          recipientType: 'patient',
          message: `Your correction request has been reviewed by Dr. ${userData.name}`,
          recordId: request.recordId,
          createdAt: serverTimestamp(),
          read: false
        });
      }

      alert(`Correction request ${action}d successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing correction request:`, error);
      alert(`Failed to ${action} correction request. Please try again.`);
    }
  };

  const addPrescription = () => {
    setEditForm(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, {
        medicine: '',
        dosage: '',
        frequency: '',
        timeInterval: ''
      }]
    }));
  };

  const updatePrescription = (index, field, value) => {
    setEditForm(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.map((prescription, i) => 
        i === index ? { ...prescription, [field]: value } : prescription
      )
    }));
  };

  const removePrescription = (index) => {
    setEditForm(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const getCaseStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'deteriorating':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-blue-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFilteredRecords = () => {
    const records = activeTab === 'pending' ? pendingRecords : verifiedRecords;
    return records.filter(record => 
      record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosedDisease?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredCorrectionRequests = () => {
    return correctionRequests.filter(request =>
      request.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Stethoscope className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Doctor Dashboard</h1>
                <p className="text-sm text-gray-500">Dr. {userData?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-600"
              >
                <Bell className="w-6 h-6" />
                {correctionRequests.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {correctionRequests.length}
                  </span>
                )}
              </button>
              <div className="flex space-x-2 text-sm">
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                  {pendingRecords.length} Pending
                </div>
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                  {correctionRequests.length} Corrections
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending Records ({pendingRecords.length})
            </button>
            <button
              onClick={() => setActiveTab('corrections')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'corrections'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Correction Requests ({correctionRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('verified')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'verified'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Verified Records ({verifiedRecords.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search records or patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Pending Verification</h2>
            {getFilteredRecords().length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Records</h3>
                <p className="text-gray-500">All records have been verified.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredRecords().map((record) => (
                  <div key={record.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900">{record.patientName}</span>
                      </div>
                      <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        Pending
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {record.date ? new Date(record.date.toDate()).toLocaleDateString() : 'Date not available'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        <span className="font-medium">Disease:</span>
                        <span className="ml-1">{record.diagnosedDisease || 'Not specified'}</span>
                      </div>
                      {record.reportImages && record.reportImages.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Image className="w-4 h-4 mr-2" />
                          <span>{record.reportImages.length} Report Image(s)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleVerifyRecord(record.id, record)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Quick Verify
                      </button>
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                      >
                        Edit & Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'corrections' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Correction Requests</h2>
            {getFilteredCorrectionRequests().length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Correction Requests</h3>
                <p className="text-gray-500">No pending correction requests to review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredCorrectionRequests().map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-orange-600 mr-2" />
                        <span className="font-medium text-gray-900">{request.patientName}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.createdAt ? new Date(request.createdAt.toDate()).toLocaleDateString() : 'Date not available'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Correction Request:</h4>
                      <p className="text-gray-700">{request.message}</p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const response = prompt('Enter your response (optional):');
                          if (response !== null) {
                            handleCorrectionRequest(request.id, 'approve', response);
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const response = prompt('Enter reason for rejection:');
                          if (response !== null) {
                            handleCorrectionRequest(request.id, 'reject', response);
                          }
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          // Find the record and open for editing
                          const record = [...pendingRecords, ...verifiedRecords].find(r => r.id === request.recordId);
                          if (record) {
                            handleEditRecord(record);
                          }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Edit Record
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'verified' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Verified Records</h2>
            {getFilteredRecords().length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Verified Records</h3>
                <p className="text-gray-500">No records have been verified yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredRecords().map((record) => (
                  <div key={record.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium text-gray-900">{record.patientName}</span>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Verified
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {record.date ? new Date(record.date.toDate()).toLocaleDateString() : 'Date not available'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        <span className="font-medium">Disease:</span>
                        <span className="ml-1">{record.diagnosedDisease || 'Not specified'}</span>
                      </div>
                      {record.caseStatus && (
                        <div className="flex items-center text-sm text-gray-600">
                          {getCaseStatusIcon(record.caseStatus)}
                          <span className="ml-2 font-medium">Status:</span>
                          <span className="ml-1 capitalize">{record.caseStatus}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Record Details Modal */}
      {selectedRecord && !editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Medical Record Details</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div><strong>Patient:</strong> {selectedRecord.patientName}</div>
                    <div><strong>Date:</strong> {selectedRecord.date ? new Date(selectedRecord.date.toDate()).toLocaleDateString() : 'Not available'}</div>
                    <div><strong>Disease:</strong> {selectedRecord.diagnosedDisease || 'Not specified'}</div>
                    <div><strong>Case Status:</strong> 
                      <span className="ml-2 capitalize flex items-center">
                        {getCaseStatusIcon(selectedRecord.caseStatus)}
                        <span className="ml-1">{selectedRecord.caseStatus || 'Not specified'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Prescriptions</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      {selectedRecord.prescriptions.map((prescription, index) => (
                        <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                          <div className="font-medium">{prescription.medicine}</div>
                          <div className="text-sm text-gray-600">
                            {prescription.dosage} - {prescription.frequency}
                          </div>
                          {prescription.timeInterval && (
                            <div className="text-sm text-gray-500">
                              Interval: {prescription.timeInterval}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRecord.recommendations && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedRecord.recommendations}</p>
                    </div>
                  </div>
                )}

                {selectedRecord.reportImages && selectedRecord.reportImages.length > 0 && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900">Report Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedRecord.reportImages.map((imageUrl, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`Report ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                {!selectedRecord.verified && (
                  <>
                    <button
                      onClick={() => handleVerifyRecord(selectedRecord.id, selectedRecord)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Verify Record
                    </button>
                    <button
                      onClick={() => handleEditRecord(selectedRecord)}
                      className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                    >
                      Edit & Verify
                    </button>
                  </>
                )}
                {selectedRecord.verified && (
                  <button
                    onClick={() => handleEditRecord(selectedRecord)}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                  >
                    Edit Record
                  </button>
                )}
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRecord.verified ? 'Edit Medical Record' : 'Edit & Verify Medical Record'}
                </h2>
                <button
                  onClick={() => setEditingRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Info (Read-only) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Patient:</strong> {editingRecord.patientName}</div>
                    <div><strong>Date:</strong> {editingRecord.date ? new Date(editingRecord.date.toDate()).toLocaleDateString() : 'Not available'}</div>
                  </div>
                </div>

                {/* Diagnosed Disease */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosed Disease *
                  </label>
                  <input
                    type="text"
                    value={editForm.diagnosedDisease}
                    onChange={(e) => setEditForm(prev => ({ ...prev, diagnosedDisease: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter diagnosed disease"
                  />
                </div>

                {/* Case Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Status
                  </label>
                  <select
                    value={editForm.caseStatus}
                    onChange={(e) => setEditForm(prev => ({ ...prev, caseStatus: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="stable">Stable</option>
                    <option value="improving">Improving</option>
                    <option value="deteriorating">Deteriorating</option>
                  </select>
                </div>

                {/* Prescriptions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Prescriptions
                    </label>
                    <button
                      onClick={addPrescription}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add Prescription
                    </button>
                  </div>
                  
                  {editForm.prescriptions.map((prescription, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">Prescription {index + 1}</h4>
                        <button
                          onClick={() => removePrescription(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Medicine Name
                          </label>
                          <input
                            type="text"
                            value={prescription.medicine}
                            onChange={(e) => updatePrescription(index, 'medicine', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Medicine name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={prescription.dosage}
                            onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Frequency
                          </label>
                          <input
                            type="text"
                            value={prescription.frequency}
                            onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 2 times daily"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Time Interval
                          </label>
                          <input
                            type="text"
                            value={prescription.timeInterval}
                            onChange={(e) => updatePrescription(index, 'timeInterval', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Every 12 hours"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommendations to Patient
                  </label>
                  <textarea
                    value={editForm.recommendations}
                    onChange={(e) => setEditForm(prev => ({ ...prev, recommendations: e.target.value }))}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter recommendations for the patient..."
                  />
                </div>

                {/* Report Images (Read-only display) */}
                {editingRecord.reportImages && editingRecord.reportImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Images
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {editingRecord.reportImages.map((imageUrl, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`Report ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setEditingRecord(null)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                {editingRecord.verified ? (
                  <button
                    onClick={handleSaveEdit}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() => handleVerifyAndEdit(editingRecord.id)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Verify & Save
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;