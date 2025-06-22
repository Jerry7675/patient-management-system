import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';
import Spinner from './components/Spinner';
import { useAuthContext } from './context/AuthContext';

import PatientDashboard from './features/patient/Dashboard';
import DoctorDashboard from './features/doctor/Dashboard';
import ManagementDashboard from './features/management/Dashboard';
import AdminDashboard from './features/admin/Dashboard';
import VerificationPending from './features/auth/VerificationPending';

import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';
import Unauthorized from './components/Unauthorized';




function App() {
  const { loading } = useAuthContext();
if (loading) return <Spinner />;
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/verification-pending" element={<VerificationPending />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/login" element={<Login />} />
        {/* Protected Routes */}
        <Route
          path="/patient/dashboard"
          element={
            <RoleRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/doctor/dashboard"
          element={
            <RoleRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/management/dashboard"
          element={
            <RoleRoute allowedRoles={['management']}>
              <ManagementDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
