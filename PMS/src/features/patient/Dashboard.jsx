// src/features/patient/Dashboard.jsx
import React from 'react';
import { useAuthContext } from '../../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuthContext();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Patient Dashboard</h1>
      <p className="mt-2">Welcome, {user?.email} 👋</p>
      {/* Add View Records, Request Correction buttons later */}
    </div>
  );
};

export default PatientDashboard;
