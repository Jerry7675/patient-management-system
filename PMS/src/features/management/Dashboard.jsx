// src/features/management/Dashboard.jsx
import { useEffect, useState } from 'react';
import { getAllPatients, addPatientRecord } from '../../services/managementService';

export default function ManagementDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form, setForm] = useState({
    disease: '',
    reportImageUrl: '',
    prescription: '',
    dosage: '',
    recommendations: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchPatients() {
      const allPatients = await getAllPatients();
      setPatients(allPatients);
    }
    fetchPatients();
  }, []);

  const handleSelectPatient = (e) => {
    const patientId = e.target.value;
    const patient = patients.find((p) => p.uid === patientId);
    setSelectedPatient(patient);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setMessage('Please select a patient');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await addPatientRecord(selectedPatient.uid, form);
      setMessage('Record added successfully and pending doctor verification.');
      // Reset form
      setForm({
        disease: '',
        reportImageUrl: '',
        prescription: '',
        dosage: '',
        recommendations: '',
      });
    } catch (err) {
      setMessage(`Failed to add record: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">Management Dashboard</h1>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Select Patient:</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2"
          onChange={handleSelectPatient}
          value={selectedPatient ? selectedPatient.uid : ''}
        >
          <option value="">-- Choose Patient --</option>
          {patients.map((patient) => (
            <option key={patient.uid} value={patient.uid}>
              {patient.email}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block font-semibold mb-1">Disease Diagnosed</label>
          <input
            name="disease"
            type="text"
            value={form.disease}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Report Image URL (optional)</label>
          <input
            name="reportImageUrl"
            type="text"
            value={form.reportImageUrl}
            onChange={handleChange}
            placeholder="URL of report image"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Prescription</label>
          <textarea
            name="prescription"
            value={form.prescription}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Dosage (e.g. 2 tablets/day)</label>
          <input
            name="dosage"
            type="text"
            value={form.dosage}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Recommendations</label>
          <textarea
            name="recommendations"
            value={form.recommendations}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={2}
          />
        </div>

        {message && <p className="text-center text-sm my-2">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-semibold"
        >
          {loading ? 'Submitting...' : 'Add Record'}
        </button>
      </form>
    </div>
  );
}
