import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Eye, Download, Calendar, User, FileText, Pill, Activity, Image, AlertCircle, Search, Filter } from 'lucide-react';

const ViewRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');

  useEffect(() => {
    fetchPatientRecords();
  }, [user]);

  const fetchPatientRecords = async () => {
    try {
      const q = query(
        collection(db, 'records'),
        where('patientId', '==', user.uid),
        where('isVerified', '==', true),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const recordsData = [];
      
      for (const docSnapshot of querySnapshot.docs) {
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
            recordData.doctorSpecialization = doctorSnapshot.docs[0].data().specialization;
          }
        }
        
        recordsData.push(recordData);
      }
      
      setRecords(recordsData);
    } catch (error) {
      console.error('Error fetching patient records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCaseStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'stable': return 'text-blue-600 bg-blue-50';
      case 'deteriorating': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.diagnosedDisease?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.prescription?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !filterDate || record.date?.toDate().toISOString().split('T')[0] === filterDate;
    const matchesDoctor = !filterDoctor || record.doctorName?.toLowerCase().includes(filterDoctor.toLowerCase());
    
    return matchesSearch && matchesDate && matchesDoctor;
  });

  const handleDownloadRecord = (record) => {
    const recordText = `
Medical Record - ${formatDate(record.date)}

Patient: ${user.displayName || user.email}
Doctor: ${record.doctorName}
Specialization: ${record.doctorSpecialization || 'N/A'}

Diagnosed Disease: ${record.diagnosedDisease}
Prescription: ${record.prescription}
Dosage: ${record.dosage}
Recommendations: ${record.recommendations}
Case Status: ${record.caseStatus}

Record ID: ${record.id}
Verified on: ${formatDate(record.verifiedAt)}
    `;
    
    const element = document.createElement('a');
    const file = new Blob([recordText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `medical-record-${formatDate(record.date).replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                My Medical Records
              </h1>
              <p className="text-gray-600 mt-1">
                View your verified medical records and treatment history
              </p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
              <span className="font-semibold">{records.length}</span> Total Records
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by disease, doctor, or prescription..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Filter by doctor name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {records.length === 0 ? 'No Medical Records' : 'No Records Found'}
            </h3>
            <p className="text-gray-600">
              {records.length === 0 
                ? 'Your verified medical records will appear here once doctors verify them.'
                : 'Try adjusting your search criteria to find specific records.'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Record Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {record.diagnosedDisease}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(record.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCaseStatusColor(record.caseStatus)}`}>
                        {record.caseStatus || 'Unknown'}
                      </span>
                      <button
                        onClick={() => setSelectedRecord(selectedRecord === record.id ? null : record.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadRecord(record)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Dr. {record.doctorName}</span>
                    {record.doctorSpecialization && (
                      <>
                        <span>•</span>
                        <span>{record.doctorSpecialization}</span>
                      </>
                    )}
                  </div>

                  {/* Quick Info */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Pill className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Prescription</p>
                        <p className="text-sm text-gray-600">{record.prescription}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Dosage</p>
                        <p className="text-sm text-gray-600">{record.dosage}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedRecord === record.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {record.recommendations}
                        </p>
                      </div>
                      
                      {record.reportImages && record.reportImages.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            Medical Reports
                          </h4>
                          <div className="flex gap-2 flex-wrap">
                            {record.reportImages.map((imageUrl, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={imageUrl}
                                  alt={`Report ${index + 1}`}
                                  className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                                  onClick={() => window.open(imageUrl, '_blank')}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
                                  <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <p>Record ID: {record.id}</p>
                        <p>Verified on: {formatDate(record.verifiedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewRecords;