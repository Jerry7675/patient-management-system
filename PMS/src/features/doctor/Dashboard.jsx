// src/features/doctor/Dashboard.jsx
import { useEffect, useState } from 'react';
import { getPendingRecords, verifyRecord, updateRecord, getRecordById } from '../../services/doctorService';

export default function DoctorDashboard() {
  const [pendingRecords, setPendingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState({ diagnosis: '', prescription: '', status: '' });

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const records = await getPendingRecords();
        setPendingRecords(records);
      } catch (err) {
        setError(err.message || 'Failed to fetch records');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const handleVerify = async (recordId) => {
    await verifyRecord(recordId);
    setPendingRecords(prev => prev.filter(record => record.id !== recordId));
  };

  const handleEditClick = async (recordId) => {
    const record = await getRecordById(recordId);
    setEditingRecord(recordId);
    setForm({
      diagnosis: record.diagnosis || '',
      prescription: record.prescription || '',
      status: record.status || '',
    });
  };

  const handleUpdate = async (recordId) => {
    await updateRecord(recordId, form);
    setEditingRecord(null);
    setPendingRecords(prev => prev.map(r => (r.id === recordId ? { ...r, ...form } : r)));
  };

  if (loading) return <p className="text-center p-4">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Doctor Dashboard</h2>
      {pendingRecords.length === 0 ? (
        <p>No pending records for verification.</p>
      ) : (
        <ul className="space-y-4">
          {pendingRecords.map((record) => (
            <li key={record.id} className="border p-4 rounded bg-white shadow">
              <p><strong>Patient:</strong> {record.patientName}</p>
              <p><strong>Date:</strong> {record.date}</p>
              <p><strong>Disease:</strong> {record.diagnosis}</p>
              <p><strong>Prescription:</strong> {record.prescription}</p>
              <p><strong>Status:</strong> {record.status}</p>

              {editingRecord === record.id ? (
                <div className="mt-4 space-y-2">
                  <input
                    type="text"
                    placeholder="Diagnosis"
                    value={form.diagnosis}
                    onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                    className="w-full border px-2 py-1 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Prescription"
                    value={form.prescription}
                    onChange={(e) => setForm({ ...form, prescription: e.target.value })}
                    className="w-full border px-2 py-1 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border px-2 py-1 rounded"
                  />
                  <button onClick={() => handleUpdate(record.id)} className="bg-blue-600 text-white px-4 py-1 rounded">Save</button>
                </div>
              ) : (
                <div className="flex space-x-4 mt-2">
                  <button onClick={() => handleVerify(record.id)} className="bg-green-600 text-white px-3 py-1 rounded">Verify</button>
                  <button onClick={() => handleEditClick(record.id)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}