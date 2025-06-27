// src/components/PatientDashboard.jsx
import { useState } from 'react';
import {
  fetchVerifiedRecordsByCurrentUser,
  requestRecordCorrection,
} from '../../services/patientService';

export default function PatientDashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showRecords, setShowRecords] = useState(false);

  const excludedFields = ['id', 'verified', 'patientUid', 'managementEntered'];

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
    } catch (err) {
      console.error('Error requesting correction:', err);
      setError('Failed to request correction.');
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
    <div className="p-8 bg-gray-50 min-h-screen max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">Welcome to Your Patient Dashboard</h1>

      <p className="text-gray-700 text-lg mb-6 max-w-3xl mx-auto text-center">
        Here you can view your verified medical records and request corrections if needed.
        Click the button below to load your records.
      </p>

      <div className="flex justify-center mb-8">
        <button
          onClick={loadRecords}
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded shadow hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'View Records'}
        </button>
      </div>

      {error && <p className="text-center text-red-600 mb-4">{error}</p>}
      {message && !loading && <p className="text-center text-green-600 mb-6">{message}</p>}

      {showRecords && records.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Disease: {record.disease || 'N/A'}
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(record).map(
                  ([key, value]) =>
                    !excludedFields.includes(key) && (
                      <div key={key} className="text-gray-700">
                        <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                        {renderFieldValue(key, value)}
                      </div>
                    )
                )}
              </div>
              <button
                onClick={() => handleCorrectionRequest(record.id)}
                className="mt-6 w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
              >
                Request Correction
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
