import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PlusCircle, 
  Search, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';

const ManagementDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRecords: 0,
    pendingVerification: 0,
    todayEntries: 0,
    totalPatients: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    // In real implementation, fetch from Firebase/API
    setTimeout(() => {
      setStats({
        totalRecords: 145,
        pendingVerification: 12,
        todayEntries: 8,
        totalPatients: 89
      });
      
      setRecentActivities([
        {
          id: 1,
          type: 'record_added',
          patient: 'John Doe',
          doctor: 'Dr. Smith',
          time: '2 hours ago',
          status: 'pending'
        },
        {
          id: 2,
          type: 'record_verified',
          patient: 'Jane Wilson',
          doctor: 'Dr. Johnson',
          time: '4 hours ago',
          status: 'verified'
        },
        {
          id: 3,
          type: 'record_added',
          patient: 'Mike Brown',
          doctor: 'Dr. Davis',
          time: '6 hours ago',
          status: 'pending'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigateToAddRecord = () => {
    navigate('/management/add-record');
  };

  const navigateToPatientSearch = () => {
    navigate('/management/patient-search');
  };

  const navigateToRecordEntry = () => {
    navigate('/management/record-entry');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Management Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {user?.email || 'Management User'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Records</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRecords}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Verification</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingVerification}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Entries</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayEntries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <button
                    onClick={navigateToAddRecord}
                    className="w-full flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                  >
                    <PlusCircle className="h-6 w-6 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Add New Record</p>
                      <p className="text-sm text-gray-500">Create a new patient record</p>
                    </div>
                  </button>

                  <button
                    onClick={navigateToPatientSearch}
                    className="w-full flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                  >
                    <Search className="h-6 w-6 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Search Patients</p>
                      <p className="text-sm text-gray-500">Find existing patient records</p>
                    </div>
                  </button>

                  <button
                    onClick={navigateToRecordEntry}
                    className="w-full flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                  >
                    <FileText className="h-6 w-6 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Record Entry</p>
                      <p className="text-sm text-gray-500">Batch record management</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
              </div>
              <div className="p-6">
                {recentActivities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent activities</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {activity.status === 'verified' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <Clock className="h-6 w-6 text-yellow-600" />
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.type === 'record_added' ? 'Record Added' : 'Record Verified'}
                            </p>
                            <span className="text-xs text-gray-500">{activity.time}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Patient: {activity.patient} | Doctor: {activity.doctor}
                          </p>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              activity.status === 'verified' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {activity.status === 'verified' ? 'Verified' : 'Pending Verification'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Tasks */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                Pending Tasks
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-gray-700">Records awaiting doctor verification</span>
                  <span className="text-sm font-medium text-orange-600">{stats.pendingVerification}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-700">OTP verifications pending</span>
                  <span className="text-sm font-medium text-blue-600">5</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                Today's Summary
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Records entered today</span>
                  <span className="text-sm font-medium text-green-600">{stats.todayEntries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Records verified today</span>
                  <span className="text-sm font-medium text-blue-600">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Active sessions</span>
                  <span className="text-sm font-medium text-purple-600">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementDashboard;