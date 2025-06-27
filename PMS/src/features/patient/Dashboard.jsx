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

  const excludedFields = ['id', 'verified', 'patientUid'];

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await fetchVerifiedRecordsByCurrentUser();
      setRecords(data);
      if (data.length === 0) setMessage('No verified records found.');
    } catch (err) {
      console.error('Error loading records:', err);
      setError('Failed to load records.');
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
          <table className="table-auto border mt-2 text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1">Medicine</th>
                <th className="border px-2 py-1">Times</th>
              </tr>
            </thead>
            <tbody>
              {value.map((item, index) => (
                <tr key={index}>
                  <td className="border px-2 py-1">{item.medicine}</td>
                  <td className="border px-2 py-1">{Array.isArray(item.times) ? item.times.join(', ') : item.times}</td>
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
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Patient Dashboard</h1>

      <button
        onClick={loadRecords}
        className="bg-blue-600 text-white px-4 py-2 rounded shadow mb-4 hover:bg-blue-700"
      >
        View Records
      </button>

      {loading && <p>Loading records...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}

      <div className="space-y-4">
        {records.map((record) => (
          <div
            key={record.id}
            className="p-4 bg-white shadow rounded border border-gray-200"
          >
            {Object.entries(record).map(([key, value]) => (
              !excludedFields.includes(key) && (
                <div key={key} className="mb-2">
                  <strong>{key}:</strong> {renderFieldValue(key, value)}
                </div>
              )
            ))}

            <button
              onClick={() => handleCorrectionRequest(record.id)}
              className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              Request Correction
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
