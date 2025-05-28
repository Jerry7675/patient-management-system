import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { db } from '../../services/firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy,
  onSnapshot,
  updateDoc,
  doc 
} from 'firebase/firestore';
import { 
  User, 
  FileText, 
  Calendar, 
  Stethoscope, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Edit3,
  Image,
  Pill,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

const PatientDashboard = () => {
  const { currentUser, userData } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [correctionRequest, setCorrectionRequest] = useState('');
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, verified, pending
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentUser || !userData) return;

    const fetchRecords = async () => {
      try {
        const recordsRef = collection(db, 'medicalRecords');
        const q = query(
          recordsRef,
          where('patientId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const recordsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRecords(recordsData);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching records:', error);
        setLoading(false);
      }
    };

    fetchRecords();
  }, [currentUser, userData]);

  const handleCorrectionRequest = async (recordId) => {
    if (!correctionRequest.trim()) return;

    try {
      const correctionData = {
        recordId,
        patientId: currentUser.uid,
        patientName: userData.name,
        message: correctionRequest,
        status: 'pending',
        createdAt: new Date(),
        doctorId: selectedRecord.doctorId,
        doctorName: selectedRecord.doctorName
      };

      await addDoc(collection(db, 'correctionRequests'), correctionData);
      
      // Update the record to show correction requested
      const recordRef = doc(db, 'medicalRecords', recordId);
      await updateDoc(recordRef, {
        correctionRequested: true,
        correctionRequestDate: new Date()
      });

      setCorrectionRequest('');
      setShowCorrectionModal(false);
      setSelectedRecord(null);
      
      alert('Correction request sent successfully!');
    } catch (error) {
      console.error('Error sending correction request:', error);
      alert('Failed to send correction request. Please try again.');
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesFilter = filter === 'all' || 
      (filter === 'verified' && record.verified) ||
      (filter === 'pending' && !record.verified);
    
    const matchesSearch = searchTerm === '' ||
      record.diagnosedDisease?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (record) => {
    if (record.correctionRequested) {
      return <Edit3 className="w-4 h-4 text-orange-500" />;
    }
    if (record.verified) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = (record) => {
    if (record.correctionRequested) return 'Correction Requested';
    if (record.verified) return 'Verified';
    return 'Pending Verification';
  };

  const getStatusColor = (record) => {
    if (record.correctionRequested) return 'bg-orange-100 text-orange-800';
    if (record.verified) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getCaseStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'deteriorating':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your medical records...</p>
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
              <User className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Patient Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {userData?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {records.length} Records
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'verified' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'pending' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pending
            </button>
          </div>
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by disease or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Records Grid */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You don't have any medical records yet." 
                : `No ${filter} records found.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Stethoscope className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-900">{record.doctorName}</span>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(record)}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 ${getStatusColor(record)}`}>
                    {getStatusText(record)}
                  </div>

                  {/* Record Details */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {record.date ? new Date(record.date.toDate()).toLocaleDateString() : 'Date not available'}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <AlertCircle className="w-4 h-4 mr-2" />
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

                    {record.reportImages && record.reportImages.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Image className="w-4 h-4 mr-2" />
                        <span>{record.reportImages.length} Report Image(s)</span>
                      </div>
                    )}

                    {record.prescriptions && record.prescriptions.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Pill className="w-4 h-4 mr-2" />
                        <span>{record.prescriptions.length} Prescription(s)</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex space-x-2">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                    {record.verified && !record.correctionRequested && (
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowCorrectionModal(true);
                        }}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                      >
                        Request Correction
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Details Modal */}
      {selectedRecord && !showCorrectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Medical Record Details</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div><strong>Doctor:</strong> {selectedRecord.doctorName}</div>
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

                {/* Prescriptions */}
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

                {/* Recommendations */}
                {selectedRecord.recommendations && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900">Doctor's Recommendations</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedRecord.recommendations}</p>
                    </div>
                  </div>
                )}

                {/* Report Images */}
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
                {selectedRecord.verified && !selectedRecord.correctionRequested && (
                  <button
                    onClick={() => setShowCorrectionModal(true)}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                  >
                    Request Correction
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

      {/* Correction Request Modal */}
      {showCorrectionModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Request Correction</h2>
              <p className="text-gray-600 mb-4">
                Please describe what needs to be corrected in this medical record:
              </p>
              <textarea
                value={correctionRequest}
                onChange={(e) => setCorrectionRequest(e.target.value)}
                placeholder="Describe the correction needed..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowCorrectionModal(false);
                    setCorrectionRequest('');
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCorrectionRequest(selectedRecord.id)}
                  disabled={!correctionRequest.trim()}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;