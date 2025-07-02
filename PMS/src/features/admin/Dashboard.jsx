import { useEffect, useState, Fragment } from 'react';
import { getAllUsers, verifyUser, rejectUser } from '../../services/adminService';
import { getUserProfile } from '../../firebase/firestore';
import Layout from '../../components/Layout';
import ProfileSidebar from '../../components/ProfileSidebar';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeProfileUid, setActiveProfileUid] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const allUsers = await getAllUsers();
    setUsers(allUsers);
    setLoading(false);
  };

  const handleVerify = async (uid) => {
    setMessage('');
    try {
      await verifyUser(uid);
      setMessage('User verified successfully!');
      fetchUsers();
    } catch (err) {
      setMessage(`Verification failed: ${err.message}`);
    }
  };

  const handleReject = async (uid) => {
    setMessage('');
    try {
      await rejectUser(uid);
      setMessage('User rejected and removed.');
      fetchUsers();
    } catch (err) {
      setMessage(`Rejection failed: ${err.message}`);
    }
  };

  const toggleProfile = async (uid) => {
    if (activeProfileUid === uid) {
      setActiveProfileUid(null);
      setActiveProfile(null);
    } else {
      const profile = await getUserProfile(uid);
      setActiveProfile(profile);
      setActiveProfileUid(uid);
    }
  };

  const pendingUsers = users.filter((u) => u.status === 'pending');
  const verifiedUsersByRole = {
    patient: users.filter((u) => u.status === 'verified' && u.role === 'patient'),
    doctor: users.filter((u) => u.status === 'verified' && u.role === 'doctor'),
    management: users.filter((u) => u.status === 'verified' && u.role === 'management'),
    admin: users.filter((u) => u.status === 'verified' && u.role === 'admin'),
  };

  if (loading) return <p className="text-center p-4">Loading users...</p>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">Admin Dashboard</h1>
          <ProfileSidebar />
        </div>

        {message && (
          <p className="mb-4 text-center text-sm text-green-600">{message}</p>
        )}

        <UserTable
          title="Pending Verifications"
          users={pendingUsers}
          onVerify={handleVerify}
          onReject={handleReject}
          onProfileClick={toggleProfile}
          activeProfileUid={activeProfileUid}
          activeProfile={activeProfile}
        />

        <UserTable
          title="Verified Patients"
          users={verifiedUsersByRole.patient}
          onProfileClick={toggleProfile}
          activeProfileUid={activeProfileUid}
          activeProfile={activeProfile}
        />
        <UserTable
          title="Verified Doctors"
          users={verifiedUsersByRole.doctor}
          onProfileClick={toggleProfile}
          activeProfileUid={activeProfileUid}
          activeProfile={activeProfile}
        />
        <UserTable
          title="Verified Management"
          users={verifiedUsersByRole.management}
          onProfileClick={toggleProfile}
          activeProfileUid={activeProfileUid}
          activeProfile={activeProfile}
        />
        <UserTable
          title="Verified Admins"
          users={verifiedUsersByRole.admin}
          onProfileClick={toggleProfile}
          activeProfileUid={activeProfileUid}
          activeProfile={activeProfile}
        />
      </div>
    </Layout>
  );
}

function UserTable({ title, users, onVerify, onReject, onProfileClick, activeProfileUid, activeProfile }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
      <div className="overflow-x-auto border rounded shadow">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-indigo-100">
            <tr>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Role</th>
              <th className="border px-4 py-2">Status</th>
              {onVerify && <th className="border px-4 py-2">Actions</th>}
              <th className="border px-4 py-2">Profile</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map(({ uid, email, role, status }) => (
                <Fragment key={uid}>
                  <tr className="hover:bg-indigo-50">
                    <td className="border px-4 py-2">{email}</td>
                    <td className="border px-4 py-2 capitalize">{role}</td>
                    <td className="border px-4 py-2 text-center capitalize">{status}</td>
                    {onVerify && (
                      <td className="border px-4 py-2 text-center space-x-2">
                        <button onClick={() => onVerify(uid)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Verify</button>
                        <button onClick={() => onReject(uid)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Reject</button>
                      </td>
                    )}
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => onProfileClick(uid)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        {activeProfileUid === uid ? 'Close' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {activeProfileUid === uid && activeProfile && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4 text-left">
                        <div className="text-sm space-y-1">
                          <p><strong>Name:</strong> {activeProfile.name || 'N/A'}</p>
                          <p><strong>DOB:</strong> {activeProfile.dob || 'N/A'}</p>
                          <p><strong>Phone:</strong> {activeProfile.phone || 'N/A'}</p>
                          <p><strong>Address:</strong> {activeProfile.address || 'N/A'}</p>
                          <p><strong>Citizenship No:</strong> {activeProfile.citizenshipNo || 'N/A'}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}