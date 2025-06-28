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
    setSearchTerm(patient.profile?.name || patient.email);
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
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Main Container */}
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">Patient Records</h1>
              <p className="text-gray-600">Manage and add patient medical records</p>
            </div>
            <div className="mt-4 md:mt-0">
              <ProfileSidebar />
            </div>
          </div>

          {/* Dashboard Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Card Header */}
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Add New Record</h2>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-6">
              {/* Patient Search Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Search Patient</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {searchTerm && filteredPatients.length > 0 && (
                  <ul className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-y-auto">
                    {filteredPatients.map((p) => (
                      <li
                        key={p.uid}
                        onClick={() => handleSelectPatient(p)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {p.profile?.name || 'Unnamed Patient'}
                          </p>
                          <p className="text-sm text-gray-500">{p.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {searchTerm && filteredPatients.length === 0 && (
                  <div className="mt-2 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">No matching patient found</p>
                  </div>
                )}
              </div>

              {/* Selected Patient Display */}
              {selectedPatient && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedPatient.profile?.name || 'Unnamed Patient'}
                    </h3>
                    <p className="text-sm text-blue-600">{selectedPatient.email}</p>
                  </div>
                </div>
              )}

              {/* Disease Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Select Condition</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => setSelectedFormType(e.target.value)}
                  value={selectedFormType}
                >
                  <option value="">Select a medical condition...</option>
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

              {/* Disease Form */}
              {selectedFormType && (
                <div className="border-t border-gray-200 pt-6">
                  <DiseaseFormSelector
                    type={selectedFormType}
                    onSubmit={handleFormSubmit}
                    patient={selectedPatient}
                  />
                </div>
              )}

              {/* Status Message */}
              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.includes('Failed')
                      ? 'bg-red-50 text-red-700'
                      : 'bg-green-50 text-green-700'
                  }`}
                >
                  <div className="flex items-start">
                    <span className="font-medium">{message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}