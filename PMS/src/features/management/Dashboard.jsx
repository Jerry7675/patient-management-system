// src/features/management/Dashboard.jsx
import React from 'react';
import { useAuthContext } from '../../context/AuthContext';

const ManagementDashboard = () => {
  const { user } = useAuthContext();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Management Dashboard</h1>
      <p className="mt-2">Welcome, {user?.email}</p>
      {/* Add Add Record, Upload Reports sections later */}
    </div>
  );
};

export default ManagementDashboard;
