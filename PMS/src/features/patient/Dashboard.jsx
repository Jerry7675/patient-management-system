import { useState } from 'react';
import {
  fetchVerifiedRecordsByCurrentUser,
  requestRecordCorrection,
} from '../../services/patientService';
import Layout from '../../components/Layout';
import ProfileSidebar from '../../components/ProfileSidebar'; 

export default function PatientDashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showRecords, setShowRecords] = useState(false);
  const [recordToCorrect, setRecordToCorrect] = useState(null);

  const excludedFields = [
    'id', 
    'verified', 
    'patientUid', 
    'managementEntered',
    'requestedCorrection', 
    'lastModified',         
    'verifiedAt'           
  ];

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await fetchVerifiedRecordsByCurrentUser();
      const sorted = data.sort((a, b) => b.date?.toDate?.() - a.date?.toDate?.());
      setRecords(sorted);
      if (sorted.length === 0) setMessage('No verified records found.');
      else setMessage('');
      setShowRecords(true);
    } catch (err) {
      console.error('Error loading records:', err);
      setError('Failed to load records.');
      setShowRecords(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectionRequest = async (recordId) => {
    try {
      await requestRecordCorrection(recordId);
      setMessage('Correction request submitted successfully.');
      setRecords((prev) => prev.filter((rec) => rec.id !== recordId));
      setRecordToCorrect(null);
    } catch (err) {
      console.error('Error requesting correction:', err);
      setError('Failed to request correction.');
      setRecordToCorrect(null);
    }
  };

  const renderFieldValue = (key, value) => {
    if (key === 'date' && value?.toDate) {
      return value.toDate().toLocaleString();
    } else if (Array.isArray(value)) {
      if (key === 'prescription') {
        return (
          <table className="table-auto border mt-2 text-sm w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">Medicine</th>
                <th className="border px-3 py-2 text-left">Times</th>
              </tr>
            </thead>
            <tbody>
              {value.map((item, index) => (
                <tr key={index}>
                  <td className="border px-3 py-2">{item.medicine}</td>
                  <td className="border px-3 py-2">
                    {Array.isArray(item.times) ? item.times.join(', ') : item.times}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      } else {
        return value.join(', ');
      }
    } else if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    } else {
      return String(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <Layout>
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-indigo-800 mb-3">Your Medical Records</h1>
            <p className="text-lg text-indigo-600 max-w-2xl mx-auto">
              Access and manage your verified medical records. Request corrections if needed.
            </p>
            <ProfileSidebar />
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col items-center">
              <button
                onClick={loadRecords}
                disabled={loading}
                className={`px-8 py-3 rounded-lg font-medium text-white shadow-md transition-all ${
                  loading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Records...
                  </span>
                ) : (
                  'View My Medical Records'
                )}
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {message && !loading && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Records Display */}
          {showRecords && records.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition"
                >
                  <div className="bg-indigo-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                      {record.disease || 'Medical Record'} - {record.date?.toDate?.().toLocaleDateString() || ''}
                    </h2>
                  </div>
                  
                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(record).map(
                      ([key, value]) =>
                        !excludedFields.includes(key) && (
                          <div key={key} className="border-b border-gray-100 pb-3 last:border-0">
                            <h3 className="text-sm font-medium text-indigo-600 uppercase tracking-wider mb-1">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>
                            <div className="text-gray-700">
                              {renderFieldValue(key, value)}
                            </div>
                          </div>
                        )
                    )}
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={() => setRecordToCorrect(record.id)}
                      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition"
                    >
                      Request Correction
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {showRecords && records.length === 0 && !loading && (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No records found</h3>
              <p className="mt-1 text-gray-500">You don't have any verified medical records yet.</p>
            </div>
          )}
        </div>

        {/* Confirmation Dialog with Transparent Background */}
        {recordToCorrect && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'transparent' }}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative z-10 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Correction Request</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to request a correction for this medical record? 
                This will notify the doctor who created the record.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setRecordToCorrect(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCorrectionRequest(recordToCorrect)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                >
                  Confirm Request
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </div>
  );
}