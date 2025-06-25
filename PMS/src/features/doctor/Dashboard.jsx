// src/components/DoctorDashboard.jsx
import { useEffect, useState } from 'react';
import { getAllRecords } from '../../services/doctorService';

export default function DoctorDashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRecords() {
      try {
        setLoading(true);
        const allRecords = await getAllRecords();
        setRecords(allRecords);
        setError('');
      } catch (err) {
        setError('Failed to load records: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecords();
  }, []);

  if (loading) return <p>Loading records...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (records.length === 0) return <p>No records available.</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Patient Records</h2>
      <ul className="space-y-4">
        {records.map((record) => (
          <li
            key={record.id}
            className="border p-4 rounded shadow-sm hover:shadow-md transition"
          >
            <p><strong>Patient:</strong> {record.patientName || 'Unknown'}</p>
            <p><strong>Disease:</strong> {record.disease || 'N/A'}</p>
            <p><strong>Doctor:</strong> {record.doctorName || 'N/A'}</p>
            <p><strong>Verified:</strong> {record.verified ? 'Yes' : 'No'}</p>
            <p>
              <strong>Date:</strong>{' '}
              {record.date
                ? new Date(record.date.seconds * 1000).toLocaleString()
                : 'N/A'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
