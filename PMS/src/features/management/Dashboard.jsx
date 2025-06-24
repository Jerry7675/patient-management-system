import { useEffect, useState } from 'react';
import { getAllPatients, addPatientRecord } from '../../services/managementService';
import Layout from '../../components/Layout';
import ProfileSidebar from '../../components/ProfileSidebar';
import DiseaseFormSelector from './forms/DiseaseFormSelector';

export default function ManagementDashboard() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedFormType, setSelectedFormType] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchPatients() {
      const allPatients = await getAllPatients();
      setPatients(allPatients);
      setFilteredPatients(allPatients);
    }
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredPatients(
        patients.filter(
          (p) =>
            p.email.toLowerCase().includes(term) ||
            (p.profile?.name || '').toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, patients]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.profile?.name || patient.email); // Update search box with selected name/email
  };

  const handleFormSubmit = async (formData) => {
    if (!selectedPatient) {
      setMessage('Please select a patient.');
      return;
    }
    setMessage('');
    try {
      await addPatientRecord(selectedPatient.uid, formData);
      setMessage('Record added successfully and pending doctor verification.');
    } catch (err) {
      setMessage(`Failed to add record: ${err.message}`);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-600">Management Dashboard</h1>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add Patient Record</h2>
          <ProfileSidebar />
        </div>

        {/* Patient Search */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Search Patient (by name or email):</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter patient name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && filteredPatients.length > 0 && (
            <ul className="border mt-2 max-h-40 overflow-y-auto bg-white shadow-md rounded">
              {filteredPatients.map((p) => (
                <li
                  key={p.uid}
                  onClick={() => handleSelectPatient(p)}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                >
                  {p.profile?.name || 'Unnamed'} ({p.email})
                </li>
              ))}
            </ul>
          )}
          {searchTerm && filteredPatients.length === 0 && (
            <p className="text-sm text-red-600 mt-2">No matching patient found.</p>
          )}
        </div>

        {/* Selected Patient Info */}
        {selectedPatient && (
          <div className="mb-4 p-4 bg-gray-100 border rounded">
            <p className="font-semibold">
              Selected Patient: {selectedPatient.profile?.name || 'Unnamed'} ({selectedPatient.email})
            </p>
          </div>
        )}

        {/* Disease Selection */}
        <div className="mb-6">
          <label className="block mb-1 font-semibold">Select Form Type:</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            onChange={(e) => setSelectedFormType(e.target.value)}
            value={selectedFormType}
          >
            <option value="">-- Choose Disease --</option>
            <option value="fever">Fever</option>
            <option value="diabetes">Diabetes</option>
            <option value="cardiac">Cardiac</option>
            <option value="neurology">Neurology</option>
            <option value="allergies">Allergies</option>
            <option value="respiratory">Respiratory</option>
            <option value="hypertension">Hypertension</option>
            <option value="kidneyDisease">Kidney Disease</option>
          </select>
        </div>

        {/* Message */}
        {message && <p className="text-center text-green-600 mb-4">{message}</p>}

        {/* Disease Form */}
        {selectedFormType && (
          <DiseaseFormSelector
            type={selectedFormType}
            onSubmit={handleFormSubmit}
            patient={selectedPatient}
          />
        )}
      </div>
    </Layout>
  );
}
