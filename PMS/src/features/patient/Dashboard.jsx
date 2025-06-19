// src/features/patient/Dashboard.jsx
import { useEffect, useState } from 'react';
import { getPatientRecords } from '../../services/patientService';
import Layout from '../../components/Layout';

export default function PatientDashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await getPatientRecords();
        setRecords(data);
      } catch (err) {
        setError('Failed to load records');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return (
    <Layout>
   
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">Patient Dashboard</h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">👤 Profile</h2>
        <div className="bg-white p-4 shadow rounded">Patient profile information will be shown here.</div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">📝 Options</h2>
        <div className="flex gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Request Correction</button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">View Records</button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">💊 Diagnosis & Prescriptions</h2>
        {loading ? (
          <p>Loading records...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="space-y-4">
            {records.map((rec, index) => (
              <div key={index} className="bg-white p-4 rounded shadow">
                <p><strong>Date:</strong> {rec.date}</p>
                <p><strong>Doctor:</strong> {rec.doctor}</p>
                <p><strong>Disease:</strong> {rec.disease}</p>
                <p><strong>Prescription:</strong> {rec.prescription}</p>
                <p><strong>Dose:</strong> {rec.dose}</p>
                <p><strong>Recommendations:</strong> {rec.recommendation}</p>
                <p><strong>Case Status:</strong> {rec.status}</p>
                {rec.reportUrl && (
                  <a
                    href={rec.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline block mt-2"
                  >
                    📄 View Report
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
    </Layout>
  );
}
