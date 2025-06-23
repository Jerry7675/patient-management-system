import { useEffect, useState } from 'react';
import { getAllUsers, verifyUser, rejectUser } from '../../services/adminService';
import Layout from '../../components/Layout';
import ProfileSidebar from '../../components/ProfileSidebar';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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

  // Filter users by status
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
        />

        <UserTable title="Verified Patients" users={verifiedUsersByRole.patient} />
        <UserTable title="Verified Doctors" users={verifiedUsersByRole.doctor} />
        <UserTable title="Verified Management" users={verifiedUsersByRole.management} />
        <UserTable title="Verified Admins" users={verifiedUsersByRole.admin} />
      </div>
    </Layout>
  );
}

// Reusable User Table component
function UserTable({ title, users, onVerify, onReject }) {
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
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={onVerify ? 4 : 3} className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map(({ uid, email, role, status }) => (
                <tr key={uid} className="hover:bg-indigo-50">
                  <td className="border px-4 py-2">{email}</td>
                  <td className="border px-4 py-2 capitalize">{role}</td>
                  <td className="border px-4 py-2 text-center capitalize">{status}</td>
                  {onVerify && (
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => onVerify(uid)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => onReject(uid)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
