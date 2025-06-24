// src/features/doctor/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { getPendingRecords, verifyRecordWithPatient, editRecord } from '../../services/doctorService';
import Layout from '../../components/Layout'; 
import ProfileSidebar from '../../components/ProfileSidebar';

export default function DoctorDashboard() {
  const { user } = useAuthContext();
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
      const records = await getPendingRecords(user.email);
      setPendingRecords(records);
    } catch (error) {
      setMessage('Failed to load records: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record) => {
    setEditRecordId(record.id);

    // Prepare prescription field for editing
    let prescriptionText = '';
    if (Array.isArray(record.prescription)) {
      // Format array prescription into readable string
      prescriptionText = record.prescription.map((row, i) => {
        const meds = row.medicine || '';
        const times = (row.times || []).join(', ');
        return `Medicine: ${meds} | Times: ${times}`;
      }).join('\n');
    } else {
      prescriptionText = record.prescription || '';
    }

    setEditForm({
      disease: record.disease || '',
      prescription: prescriptionText,
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
      const record = pendingRecords.find((rec) => rec.id === editRecordId);
      if (!record) throw new Error('Record not found');

      // If prescription was edited as text, you may want to convert it back to your expected format,
      // but here we just save the edited text directly for simplicity.
      // You can improve by parsing the text back into array if needed.

      await editRecord(record.patientUid, editRecordId, {
        disease: editForm.disease,
        prescription: editForm.prescription,
        dosage: editForm.dosage,
        recommendations: editForm.recommendations,
      });
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Patient Dashboard</h1>
          <ProfileSidebar />
        </div>

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
                <p><strong>Date:</strong> {record.date?.seconds ? new Date(record.date.seconds * 1000).toLocaleDateString() : 'N/A'}</p>

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
                        rows={5}
                        placeholder="Edit prescription details"
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
                        rows={3}
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
                    <p><strong>Prescription:</strong></p>
                    {Array.isArray(record.prescription) ? (
                      <ul className="list-disc list-inside">
                        {record.prescription.map((row, i) => (
                          <li key={i}>
                            <strong>Medicine:</strong> {row.medicine || 'N/A'} <br />
                            <strong>Times:</strong> {(row.times || []).join(', ') || 'N/A'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{record.prescription || 'N/A'}</p>
                    )}
                    <p><strong>Dosage:</strong> {record.dosage || 'N/A'}</p>
                    <p><strong>Recommendations:</strong> {record.recommendations || 'N/A'}</p>
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
