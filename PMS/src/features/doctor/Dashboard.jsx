import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  fetchUnverifiedRecordsForDoctor,
  fetchRequestedCorrectionRecords,
  fetchVerifiedRecordsByPatientSearch,
  verifyRecord,
  updatePatientRecord,
} from '../../services/doctorService';
import Layout from '../../components/Layout';
import ProfileSidebar from '../../components/ProfileSidebar';

export default function DoctorDashboard() {
  const [doctorUid, setDoctorUid] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [verifiedRecords, setVerifiedRecords] = useState([]);
  const [unverifiedRecords, setUnverifiedRecords] = useState([]);
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('unverified');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false);
  const [recordToVerify, setRecordToVerify] = useState(null);

  // Handle auth state
  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (user) => {
      setDoctorUid(user?.uid || null);
    });
  }, []);

  // Load records when tab or doctor changes
  useEffect(() => {
    if (!doctorUid) return;

    const loadRecords = async () => {
      setLoading(true);
      setError('');
      
      try {
        if (activeTab === 'unverified') {
          const records = await fetchUnverifiedRecordsForDoctor(doctorUid);
          setUnverifiedRecords(records);
        } else if (activeTab === 'corrections') {
          const requests = await fetchRequestedCorrectionRecords(doctorUid);
          setCorrectionRequests(requests);
        }
      } catch (err) {
        setError(`Failed to load ${activeTab} records`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [doctorUid, activeTab]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setError('');
    try {
      const results = await fetchVerifiedRecordsByPatientSearch(searchInput.trim());
      setVerifiedRecords(results);
      setActiveTab('search');
    } catch (err) {
      setError('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (record) => {
    setEditingRecord(record.id);
    const { id, patientUid, verified, requestedCorrection, ...editableFields } = record;
    setFormData(editableFields);
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const cancelEditing = () => {
    setEditingRecord(null);
    setFormData({});
  };

  const saveChanges = async (recordId, patientUid) => {
    try {
      await updatePatientRecord(patientUid, recordId, formData);
      setEditingRecord(null);
      
      // Refresh current view
      if (activeTab === 'unverified') {
        setUnverifiedRecords(await fetchUnverifiedRecordsForDoctor(doctorUid));
      } else if (activeTab === 'corrections') {
        setCorrectionRequests(await fetchRequestedCorrectionRecords(doctorUid));
      } else if (activeTab === 'search') {
        setVerifiedRecords(await fetchVerifiedRecordsByPatientSearch(searchInput));
      }
    } catch (err) {
      setError('Failed to update record: ' + err.message);
    }
  };

  const handleVerify = async (recordId, patientUid) => {
    try {
      await verifyRecord(recordId, patientUid);
      setShowVerifyConfirm(false);
      // Refresh current view
      if (activeTab === 'unverified') {
        setUnverifiedRecords(await fetchUnverifiedRecordsForDoctor(doctorUid));
      } else if (activeTab === 'corrections') {
        setCorrectionRequests(await fetchRequestedCorrectionRecords(doctorUid));
      }
    } catch (err) {
      setError('Verification failed');
      console.error(err);
      setShowVerifyConfirm(false);
    }
  };

  const renderField = (key, value, recordId) => {
    if (!value || typeof value === 'object') return null;
    
    if (editingRecord === recordId) {
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <input
            type={typeof value === 'number' ? 'number' : 'text'}
            value={formData[key] || ''}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      );
    }
    
    return (
      <div key={key} className="mb-2">
        <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
        <span className="ml-2">
          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}
        </span>
      </div>
    );
  };

  const renderRecord = (record) => {
    const { id, patientUid, verified, requestedCorrection, ...fields } = record;
    
    return (
      <div key={`${patientUid}-${id}`} className="border rounded-lg p-6 mb-6 shadow-md bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(fields).map(([key, value]) => renderField(key, value, id))}
        </div>
        
        <div className="mt-4 flex justify-end space-x-3">
          {editingRecord === id ? (
            <>
              <button
                onClick={() => saveChanges(id, patientUid)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
              <button
                onClick={cancelEditing}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEditing(record)}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
              >
                Edit Record
              </button>
              {(activeTab === 'unverified' || activeTab === 'corrections') && (
                <button
                  onClick={() => {
                    setRecordToVerify({ id, patientUid });
                    setShowVerifyConfirm(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Verify Record
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Layout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Doctor Dashboard</h1>
          <ProfileSidebar doctorUid={doctorUid} />
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex">
            <input
              type="text"
              placeholder="Search verified records by patient name or email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('unverified')}
            className={`px-6 py-2 rounded-lg transition ${
              activeTab === 'unverified'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Unverified Records
          </button>
          <button
            onClick={() => setActiveTab('corrections')}
            className={`px-6 py-2 rounded-lg transition ${
              activeTab === 'corrections'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Correction Requests
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Records Display */}
        {!loading && (
          <div>
            {activeTab === 'search' ? (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">
                  Search Results for "{searchInput}"
                </h2>
                {verifiedRecords.length > 0 ? (
                  verifiedRecords.map(renderRecord)
                ) : (
                  <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500">
                    No verified records found for "{searchInput}"
                  </div>
                )}
              </>
            ) : activeTab === 'unverified' ? (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">Unverified Records</h2>
                {unverifiedRecords.length > 0 ? (
                  unverifiedRecords.map(renderRecord)
                ) : (
                  <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500">
                    No unverified records found
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">Correction Requests</h2>
                {correctionRequests.length > 0 ? (
                  correctionRequests.map(renderRecord)
                ) : (
                  <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500">
                    No correction requests found
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Verification Confirmation Dialog */}
        {showVerifyConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'transparent' }}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Verification</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to verify this medical record? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowVerifyConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerify(recordToVerify.id, recordToVerify.patientUid)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Confirm Verification
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </div>
  );
}