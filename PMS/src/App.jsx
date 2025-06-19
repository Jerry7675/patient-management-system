// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import PatientDashboard from './features/patient/Dashboard';
import DoctorDashboard from './features/doctor/Dashboard';
import ManagementDashboard from './features/management/Dashboard';
import AdminDashboard from './features/admin/Dashboard';
import './App.css'; // Assuming you have some global styles
import ForgotPassword from './features/auth/ForgotPassword';






function App() {
  return ( 
    
    <Router>
      <Routes>
      

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

       
       <Route path="/patient/dashboard" element={<PatientDashboard />} />
       <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
       <Route path="/management/dashboard" element={<ManagementDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
    
  );
}

export default App;
