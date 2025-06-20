import { useEffect, useState } from 'react';
import { getPendingRecords, verifyRecordWithPatient } from '../../services/doctorService';
import { getAuth } from 'firebase/auth';
import Spinner from '../../components/Spinner';
import NotificationBanner from '../../components/NotificationBanner';

export default function VerifyRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  const fetchPending = async () => {
    try {
      const pending = await getPendingRecords();
      setRecords(pending);
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Error fetching records', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (patientUid, recordId) => {
    try {
      const auth = getAuth();
      const doctorEmail = auth.currentUser?.email || 'Doctor';
      await verifyRecordWithPatient(patientUid, recordId, doctorEmail);

      setNotification({ message: 'Record verified successfully', type: 'success' });
      setRecords((prev) => prev.filter((rec) => !(rec.id === recordId && rec.patientUid === patientUid)));
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Failed to verify record', type: 'error' });
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Verify Records</h2>

      {notification.message && (
        <NotificationBanner
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: 'info' })}
        />
      )}

      {records.length === 0 ? (
        <p className="text-gray-600">No pending records.</p>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="border rounded p-4 bg-white shadow">
              <p><strong>Patient Email:</strong> {record.patientEmail}</p>
              <p><strong>Disease:</strong> {record.disease}</p>
              <p><strong>Prescription:</strong> {record.prescription}</p>
              <p><strong>Recommendation:</strong> {record.recommendation}</p>
              <p><strong>Date:</strong> {record.date}</p>

              <button
                className="mt-3 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => handleVerify(record.patientUid, record.id)}
              >
                ✅ Verify
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
