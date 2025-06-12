import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom' // Removed Router import
import { useAuth } from './hooks/useAuth'
import { USER_ROLES } from './utils/constants'

// Layout Components
import Header from './components/common/Header'
import Sidebar from './components/common/Sidebar'
import LoadingSpinner from './components/common/LoadingSpinner'
import NotificationBanner from './components/common/NotificationBanner'

// Auth Pages
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/auth/Login'
import Registration from './pages/auth/Registration'
import ForgotPassword from './pages/auth/ForgotPassword'
import OTPVerification from './pages/auth/OTPVerification'
import ManagementLogin from './pages/auth/ManagementLogin'

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard'
import ViewRecords from './pages/patient/ViewRecords'
import RequestCorrection from './pages/patient/RequestCorrection'
import PatientProfile from './pages/patient/PatientProfile'

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import VerifyRecords from './pages/doctor/VerifyRecords'
import ViewNotifications from './pages/doctor/ViewNotifications'
import EditRecord from './pages/doctor/EditRecord'
import CorrectionRequests from './pages/doctor/CorrectionRequests'

// Management Pages
import ManagementDashboard from './pages/management/ManagementDashboard'
import AddRecord from './pages/management/AddRecord'
import PatientSearch from './pages/management/PatientSearch'
import RecordEntry from './pages/management/RecordEntry'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AccountVerification from './pages/admin/AccountVerification'
import UserManagement from './pages/admin/UserManagement'
import SystemOverview from './pages/admin/SystemOverview'

// Shared Pages
import Policies from "./pages/shared/Polices"
import UnauthorizedAccess from './pages/shared/UnauthorizedAccess'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return children;
}

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  console.log("publicRoute - user:",user ,'loading:',loading)
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  }
  
  if (user) {
    switch (user.role) {
      case USER_ROLES.PATIENT:
        return <Navigate to="/patient/dashboard" replace />
      case USER_ROLES.DOCTOR:
        return <Navigate to="/doctor/dashboard" replace />
      case USER_ROLES.MANAGEMENT:
        return <Navigate to="/management/dashboard" replace />
      case USER_ROLES.ADMIN:
        return <Navigate to="/admin/dashboard" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }
  
  return children
}

// Layout Component
const AuthenticatedLayout = ({ children }) => {
  const location = useLocation()
  const { user } = useAuth()
  
  const authPages = [
    '/login', 
    '/register', 
    '/forgot-password', 
    '/otp-verification', 
    '/management-login'
  ]
  
  const shouldShowLayout = user && !authPages.some(page => 
    location.pathname.startsWith(page)
  )

  if (shouldShowLayout) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 ml-0 md:ml-64">
            <NotificationBanner />
            {children}
          </main>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}

function App() {


  return (
     
    <AuthProvider>
     
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Registration />
          </PublicRoute>
        } />
        
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        
        <Route path="/otp-verification" element={
          <PublicRoute>
            <OTPVerification />
          </PublicRoute>
        } />
        
        <Route path="/management-login" element={
          <PublicRoute>
            <ManagementLogin />
          </PublicRoute>
        } />

        {/* Patient Routes */}
        <Route path="/patient/dashboard" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}>
            <PatientDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/patient/records" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}>
            <ViewRecords />
          </ProtectedRoute>
        } />
        
        <Route path="/patient/request-correction" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}>
            <RequestCorrection />
          </ProtectedRoute>
        } />
        
        <Route path="/patient/profile" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}>
            <PatientProfile />
          </ProtectedRoute>
        } />

        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/doctor/verify-records" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
            <VerifyRecords />
          </ProtectedRoute>
        } />
        
        <Route path="/doctor/notifications" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
            <ViewNotifications />
          </ProtectedRoute>
        } />
        
        <Route path="/doctor/edit-record/:recordId" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
            <EditRecord />
          </ProtectedRoute>
        } />
        
        <Route path="/doctor/correction-requests" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
            <CorrectionRequests />
          </ProtectedRoute>
        } />

        {/* Management Routes */}
        <Route path="/management/dashboard" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.MANAGEMENT]}>
            <ManagementDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/management/add-record" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.MANAGEMENT]}>
            <AddRecord />
          </ProtectedRoute>
        } />
        
        <Route path="/management/patient-search" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.MANAGEMENT]}>
            <PatientSearch />
          </ProtectedRoute>
        } />
        
        <Route path="/management/record-entry/:patientId" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.MANAGEMENT]}>
            <RecordEntry />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/account-verification" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <AccountVerification />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/user-management" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <UserManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/system-overview" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <SystemOverview />
          </ProtectedRoute>
        } />

        {/* Shared Routes */}
        <Route path="/policies" element={<Policies />} />
        <Route path="/unauthorized" element={<UnauthorizedAccess />} />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        
      </Routes>
    
    </AuthProvider>
  )
}

export default App