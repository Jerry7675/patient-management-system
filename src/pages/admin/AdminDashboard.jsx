import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationBanner from '../../components/common/NotificationBanner';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      pendingVerifications: 0,
      totalRecords: 0,
      systemHealth: 'good'
    },
    recentActivity: [],
    pendingApprovals: [],
    systemAlerts: []
  });

  const [timeFilter, setTimeFilter] = useState('today'); // today, week, month, all
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    
    loadDashboardData();
    
    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadDashboardData(false); // Silent refresh
    }, 30000);
    
    setRefreshInterval(interval);
    
    return () => clearInterval(interval);
  }, [user, navigate, timeFilter]);

  const loadDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const [statsResponse, activityResponse, approvalsResponse, alertsResponse] = await Promise.all([
        fetch(`/api/admin/stats?timeFilter=${timeFilter}`),
        fetch(`/api/admin/recent-activity?timeFilter=${timeFilter}&limit=10`),
        fetch('/api/admin/pending-approvals'),
        fetch('/api/admin/system-alerts')
      ]);

      const stats = await statsResponse.json();
      const activity = await activityResponse.json();
      const approvals = await approvalsResponse.json();
      const alerts = await alertsResponse.json();

      setDashboardData({
        stats: stats.data || {
          totalUsers: 1247,
          pendingVerifications: 23,
          totalRecords: 5643,
          systemHealth: 'good',
          activeUsers: 156,
          newUsersToday: 12,
          recordsToday: 45,
          verificationRate: 92.5
        },
        recentActivity: activity.data || [
          {
            id: 1,
            type: 'user_registration',
            user: 'Dr. Sarah Johnson',
            action: 'Registered as Doctor',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            status: 'pending'
          },
          {
            id: 2,
            type: 'record_creation',
            user: 'Management Staff',
            action: 'Created medical record for John Doe',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: 'completed'
          },
          {
            id: 3,
            type: 'account_verification',
            user: 'Admin',
            action: 'Verified Dr. Mike Wilson account',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            status: 'completed'
          }
        ],
        pendingApprovals: approvals.data || [
          {
            id: 1,
            type: 'doctor_verification',
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@hospital.com',
            specialization: 'Cardiology',
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            priority: 'high'
          },
          {
            id: 2,
            type: 'management_verification',
            name: 'Alice Cooper',
            email: 'alice.cooper@management.com',
            department: 'Medical Records',
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            priority: 'medium'
          }
        ],
        systemAlerts: alerts.data || [
          {
            id: 1,
            type: 'security',
            title: 'Multiple Failed Login Attempts',
            message: '5 failed login attempts detected from IP 192.168.1.100',
            severity: 'high',
            timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString()
          },
          {
            id: 2,
            type: 'performance',
            title: 'Database Response Time',
            message: 'Database queries taking longer than usual (avg: 2.3s)',
            severity: 'medium',
            timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString()
          }
        ]
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load dashboard data. Please refresh the page.'
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleQuickAction = async (action, id = null) => {
    setLoading(true);
    
    try {
      let endpoint = '';
      let method = 'POST';
      let body = {};

      switch (action) {
        case 'approve_user':
          endpoint = `/api/admin/approve-user/${id}`;
          body = { status: 'approved' };
          break;
        case 'reject_user':
          endpoint = `/api/admin/approve-user/${id}`;
          body = { status: 'rejected' };
          break;
        case 'system_backup':
          endpoint = '/api/admin/system-backup';
          break;
        case 'clear_cache':
          endpoint = '/api/admin/clear-cache';
          break;
        case 'send_notifications':
          endpoint = '/api/admin/send-bulk-notifications';
          break;
        default:
          throw new Error('Unknown action');
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setNotification({
          type: 'success',
          message: `Action "${action}" completed successfully.`
        });
        loadDashboardData(false); // Refresh data
      } else {
        throw new Error(`Failed to execute ${action}`);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || `Failed to execute ${action}`
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getSystemHealthColor = (health) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">System overview and management</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={() => loadDashboardData()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalUsers}</p>
                <p className="text-sm text-green-600">+{dashboardData.stats.newUsersToday} today</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                <p className="text-3xl font-bold text-yellow-600">{dashboardData.stats.pendingVerifications}</p>
                <p className="text-sm text-gray-500">Requires attention</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalRecords}</p>
                <p className="text-sm text-blue-600">+{dashboardData.stats.recordsToday} today</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className={`text-3xl font-bold capitalize ${getSystemHealthColor(dashboardData.stats.systemHealth)}`}>
                  {dashboardData.stats.systemHealth}
                </p>
                <p className="text-sm text-gray-500">{dashboardData.stats.verificationRate}% uptime</p>
              </div>
              <div className="text-4xl">🔧</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/account-verification')}
              className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm font-medium text-gray-700">Account Verification</div>
            </button>

            <button
              onClick={() => navigate('/admin/user-management')}
              className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="text-sm font-medium text-gray-700">User Management</div>
            </button>

            <button
              onClick={() => navigate('/admin/system-overview')}
              className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-700">System Overview</div>
            </button>

            <button
              onClick={() => handleQuickAction('system_backup')}
              className="p-4 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <div className="text-2xl mb-2">💾</div>
              <div className="text-sm font-medium text-gray-700">System Backup</div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status === 'completed' ? '✓' : '⏳'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">by {activity.user}</p>
                      <p className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all activity →
                </button>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Pending Approvals</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.pendingApprovals.map((approval) => (
                  <div key={approval.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{approval.name}</p>
                        <p className="text-sm text-gray-600">{approval.email}</p>
                        <p className="text-xs text-gray-500">
                          {approval.specialization || approval.department}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        approval.priority === 'high' ? 'bg-red-100 text-red-700' :
                        approval.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {approval.priority}
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleQuickAction('approve_user', approval.id)}
                        className="flex-1 bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleQuickAction('reject_user', approval.id)}
                        className="flex-1 bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {dashboardData.pendingApprovals.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-gray-500">No pending approvals!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Alerts */}
        {dashboardData.systemAlerts.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">System Alerts</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.systemAlerts.map((alert) => (
                  <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(alert.severity)}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{alert.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(alert.timestamp)}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;