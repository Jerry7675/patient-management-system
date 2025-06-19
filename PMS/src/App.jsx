// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './features/auth/Login';
import Register from './features/auth/Register';

function App() {
  return (
    <Router>
      <Routes>
      

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Placeholders for role dashboards */}
        <Route path="/patient/dashboard" element={<h1>Patient Dashboard</h1>} />
        <Route path="/doctor/dashboard" element={<h1>Doctor Dashboard</h1>} />
        <Route path="/management/dashboard" element={<h1>Management Dashboard</h1>} />
        <Route path="/admin/dashboard" element={<h1>Admin Dashboard</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
