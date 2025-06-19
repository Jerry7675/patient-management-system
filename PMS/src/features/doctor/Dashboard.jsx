// src/features/doctor/Dashboard.jsx
import React from 'react';
import { useAuthContext } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuthContext();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
      <p className="mt-2">Welcome, {user?.email}</p>
      {/* Add Verify Records, Notifications, Corrections later */}
    </div>
  );
};

export default DoctorDashboard;
