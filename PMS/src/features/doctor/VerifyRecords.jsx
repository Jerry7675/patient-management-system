// src/features/doctor/Dashboard.jsx
import { useEffect, useState } from 'react';
import { getPendingRecords, verifyRecord, editRecord } from '../../services/doctorService';

export default function DoctorDashboard() {
  const [pendingRecords, setPendingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRecordId, setEditRecordId] = useState(null);
  const [editForm, setEditForm] = useState({
    disease: '',
    prescription: '',
    dosage: '',
    recommendations: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPendingRecords();
  }, []);

  const fetchPendingRecords = async () => {
    setLoading(true);
    const records = await getPendingRecords();
    setPendingRecords(records);
    setLoading(false);
  };

  const handleEditClick = (record) => {
    setEditRecordId(record.id);
    setEditForm({
      disease: record.disease,
      prescription: record.prescription,
      dosage: record.dosage,
      recommendations: record.recommendations,
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    try {
      await editRecord(editRecordId, editForm);
      setMessage('Record updated successfully.');
      setEditRecordId(null);
      fetchPendingRecords();
    } catch (err) {
      setMessage('Failed to update record: ' + err.message);
    }
  };

  const handleVerify = async (recordId) => {
    try {
      await verifyRecord(recordId);
      setMessage('Record verified successfully.');
      fetchPendingRecords();
    } catch (err) {
      setMessage('Failed to verify record: ' + err.message);
    }
  };

  if (loading) return <p className="p-4 text-center">Loading pending records...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">Doctor Dashboard - Verify Records</h1>
      {message && <p className="mb-4 text-center text-green-600">{message}</p>}

      {pendingRecords.length === 0 && (
        <p className="text-center text-gray-500">No records pending verification.</p>
      )}

      <div className="space-y-6">
        {pendingRecords.map((record) => (
          <div
            key={record.id}
            className="border border-gray-300 rounded p-4 bg-white shadow"
          >
            <p><strong>Patient:</strong> {record.patientEmail}</p>
            <p><strong>Date:</strong> {new Date(record.date.seconds * 1000).toLocaleDateString()}</p>

            {editRecordId === record.id ? (
              <>
                <div className="mt-2">
                  <label>Disease:</label>
                  <input
                    name="disease"
                    value={editForm.disease}
                    onChange={handleEditChange}
                    className="border px-2 py-1 rounded w-full"
                  />
                </div>
                <div className="mt-2">
                  <label>Prescription:</label>
                  <textarea
                    name="prescription"
                    value={editForm.prescription}
                    onChange={handleEditChange}
                    className="border px-2 py-1 rounded w-full"
                    rows={3}
                  />
                </div>
                <div className="mt-2">
                  <label>Dosage:</label>
                  <input
                    name="dosage"
                    value={editForm.dosage}
                    onChange={handleEditChange}
                    className="border px-2 py-1 rounded w-full"
                  />
                </div>
                <div className="mt-2">
                  <label>Recommendations:</label>
                  <textarea
                    name="recommendations"
                    value={editForm.recommendations}
                    onChange={handleEditChange}
                    className="border px-2 py-1 rounded w-full"
                    rows={2}
                  />
                </div>
                <button
                  onClick={handleSaveEdit}
                  className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save & Continue
                </button>
                <button
                  onClick={() => setEditRecordId(null)}
                  className="mt-3 ml-3 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p><strong>Disease:</strong> {record.disease}</p>
                <p><strong>Prescription:</strong> {record.prescription}</p>
                <p><strong>Dosage:</strong> {record.dosage}</p>
                <p><strong>Recommendations:</strong> {record.recommendations}</p>
                <button
                  onClick={() => handleVerify(record.id)}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleEditClick(record)}
                  className="mt-2 ml-3 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
