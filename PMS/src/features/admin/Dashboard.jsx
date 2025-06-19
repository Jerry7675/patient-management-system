// src/features/admin/Dashboard.jsx
import React from 'react';
import { useAuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuthContext();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2">Welcome, {user?.email}</p>
      {/* Add User Verification, System Overview later */}
    </div>
  );
};

export default AdminDashboard;
