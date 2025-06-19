// src/features/doctor/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { getPendingRecords, verifyRecordWithPatient, editRecord } from '../../services/doctorService';
import Layout from '../../components/Layout'; 
import Modal from '../../components/Modal';
import NotificationBanner from '../../components/NotificationBanner';

export default function DoctorDashboard() {
  const { user } = useAuthContext();
  const [modalOpen , setModalOpen] = useState(false);
  const [ selectedRecord, setSelectedRecord ] = useState(null);
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
    try {
      const records = await getPendingRecords();
      setPendingRecords(records);
    } catch (error) {
      setMessage('Failed to load records: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
    const handleVerifyClick = (record) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const confirmVerification = () => {
    // Call your verify record API/service with selectedRecord
    setModalOpen(false);
  };

  const handleEditClick = (record) => {
      const [notification, setNotification] = useState({ message: '', type: 'info' });
      const showNotification = (msg, type = 'info') => {
    setNotification({ message: msg, type });
    setEditRecordId(record.id);
    setEditForm({
      disease: record.disease || '',
      prescription: record.prescription || '',
      dosage: record.dosage || '',
      recommendations: record.recommendations || '',
    });
    setMessage('');
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    if (!editRecordId) return;
    setMessage('');
    try {
      // Find the record with id editRecordId to get patientUid
      const record = pendingRecords.find((rec) => rec.id === editRecordId);
      if (!record) throw new Error('Record not found');

      await editRecord(record.patientUid, editRecordId, editForm);
      setMessage('Record updated successfully.');
      setEditRecordId(null);
      fetchPendingRecords();
    } catch (err) {
      setMessage('Failed to update record: ' + err.message);
    }
  };

  const handleVerify = async (recordId) => {
    setMessage('');
    try {
      const record = pendingRecords.find((rec) => rec.id === recordId);
      if (!record) throw new Error('Record not found');

      await verifyRecordWithPatient(record.patientUid, recordId, user.email);
      setMessage('Record verified successfully.');
      fetchPendingRecords();
    } catch (err) {
      setMessage('Failed to verify record: ' + err.message);
    }
  };

  if (loading) return <p className="p-4 text-center">Loading pending records...</p>;

  return (
    <Layout>
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">Doctor Dashboard - Verify Records</h1>
      {message && <p className="mb-4 text-center text-green-600">{message}</p>}

      {pendingRecords.length === 0 ? (
        <p className="text-center text-gray-500">No records pending verification.</p>
      ) : (
        <div className="space-y-6">
          {pendingRecords.map((record) => (
            <div
              key={record.id}
              className="border border-gray-300 rounded p-4 bg-white shadow"
            >
              <p><strong>Patient Email:</strong> {record.patientEmail}</p>
              <p><strong>Date:</strong> {new Date(record.date.seconds * 1000).toLocaleDateString()}</p>

              {editRecordId === record.id ? (
                <>
                  <div className="mt-2">
                    <label className="block font-semibold">Disease:</label>
                    <input
                      name="disease"
                      value={editForm.disease}
                      onChange={handleEditChange}
                      className="border px-2 py-1 rounded w-full"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block font-semibold">Prescription:</label>
                    <textarea
                      name="prescription"
                      value={editForm.prescription}
                      onChange={handleEditChange}
                      className="border px-2 py-1 rounded w-full"
                      rows={3}
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block font-semibold">Dosage:</label>
                    <input
                      name="dosage"
                      value={editForm.dosage}
                      onChange={handleEditChange}
                      className="border px-2 py-1 rounded w-full"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block font-semibold">Recommendations:</label>
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
      )}
    </div>
    </Layout>
  );
}
