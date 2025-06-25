// src/pages/DoctorDashboard.jsx
import { useEffect, useState } from 'react';
import {
  getPendingRecords,
  getVerifiedRecordsByPatient,
  verifyRecord,
  editRecord,
} from '../../services/doctorService';
import { useAuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import ProfileForm from '../../components/ProfileForm';
import ProfileSidebar from '../../components/ProfileSidebar';

export default function DoctorDashboard() {
  const { profile, loading } = useAuthContext();
  const [pendingRecords, setPendingRecords] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editBuffer, setEditBuffer] = useState({});
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!loading && profile?.name && profile?.phone) {
      fetchPendingRecords();
    }
  }, [loading, profile]);

  const fetchPendingRecords = async () => {
    const records = await getPendingRecords(profile);
    setPendingRecords(records);
  };

  const handleSearch = async () => {
    if (!searchInput) return;
    const results = await getVerifiedRecordsByPatient(searchInput.trim());
    setSearchResults(results);
  };

  const handleFieldChange = (field, value) => {
    setEditBuffer(prev => ({ ...prev, [field]: value }));
  };

  const handleVerify = async (patientUid, recordId) => {
    const confirmed = confirm("Are you sure you want to verify this record?");
    if (!confirmed) return;

    try {
      setVerifying(true);
      if (Object.keys(editBuffer).length > 0) {
        await editRecord(patientUid, recordId, editBuffer);
      }
      await verifyRecord(patientUid, recordId);
      fetchPendingRecords(); // refresh
      setExpandedId(null);
      setEditBuffer({});
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Layout>
      <h1 className="text-2xl font-bold mb-4">👨‍⚕️ Doctor Dashboard</h1>
      <ProfileSidebar />
      {/* Search Section */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          placeholder="Search patient by UID or email"
          className="border p-2 rounded w-80"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          🔍 Search
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">Verified Records</h2>
          <div className="space-y-4">
            {searchResults.map((rec, idx) => (
              <div key={rec.id} className="border p-4 rounded bg-green-50 shadow">
                <p><b>#{idx + 1} | Patient:</b> {rec.patientName}</p>
                <p><b>Disease:</b> {rec.disease}</p>
                <p><b>Date:</b> {new Date(rec.date?.seconds * 1000).toLocaleString()}</p>
                <p><b>Doctor:</b> {rec.doctorName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Records */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">🕒 Pending Records ({pendingRecords.length})</h2>
        {pendingRecords.length === 0 ? (
          <p className="text-gray-500">No pending records.</p>
        ) : (
          <div className="space-y-4">
            {pendingRecords.map((rec, idx) => (
              <div key={rec.id} className="border p-4 rounded bg-yellow-50 shadow">
                <div className="flex justify-between items-center">
                  <p><b>#{idx + 1} | Patient:</b> {rec.patientName}</p>
                  <button
                    className="text-blue-600 underline"
                    onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                  >
                    {expandedId === rec.id ? 'Collapse' : 'Expand'}
                  </button>
                </div>

                {expandedId === rec.id && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(rec).map(([key, value]) => {
                      if (
                        ['id', 'patientUid', 'verified', 'date', 'managementEntered'].includes(key)
                      ) return null;

                      return (
                        <div key={key} className="flex flex-col">
                          <label className="capitalize font-medium">{key}</label>
                          <textarea
                            rows={key === 'imagingReports' || key === 'examFindings' ? 3 : 2}
                            defaultValue={
                              Array.isArray(value)
                                ? JSON.stringify(value, null, 2)
                                : value
                            }
                            onChange={(e) => handleFieldChange(key, e.target.value)}
                            className="border p-2 rounded bg-white"
                          />
                        </div>
                      );
                    })}

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleVerify(rec.patientUid, rec.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                        disabled={verifying}
                      >
                        ✅ {verifying ? 'Verifying...' : 'Verify'}
                      </button>
                      <button
                        onClick={() => setExpandedId(null)}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </Layout>
    </div>
  );
}
