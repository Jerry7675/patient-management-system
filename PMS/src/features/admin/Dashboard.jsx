// src/features/admin/Dashboard.jsx
import { useEffect, useState } from 'react';
import { getAllUsers, verifyUser, rejectUser } from '../../services/adminService';
import Layout from '../../components/Layout';
import logo from '../../assets/logo.png';
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

  if (loading) return <p className="p-4 text-center">Loading users...</p>;

  return (
    <Layout >
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">Admin Dashboard</h1>

      {message && (
        <p className="mb-4 text-center text-sm text-green-600">{message}</p>
      )}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-indigo-100">
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Role</th>
            <th className="border border-gray-300 px-4 py-2">Verified</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-4">No users found.</td>
            </tr>
          )}
          {users.map(({ uid, email, role, verified }) => (
            <tr key={uid} className="hover:bg-indigo-50">
              <td className="border border-gray-300 px-4 py-2">{email}</td>
              <td className="border border-gray-300 px-4 py-2 capitalize">{role}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {verified ? 'Yes' : 'No'}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                {!verified && (
                  <>
                    <button
                      onClick={() => handleVerify(uid)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleReject(uid)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </>
                )}
                {verified && <span className="text-green-700 font-semibold">Verified</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
     </Layout> 
  );

}
