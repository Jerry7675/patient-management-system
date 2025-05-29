import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Activity, Shield, TrendingUp, TrendingDown, 
  Clock, AlertTriangle, CheckCircle, XCircle, Calendar, 
  BarChart3, PieChart, RefreshCw, Download, Bell 
} from 'lucide-react';

const SystemOverview = () => {
  const [systemStats, setSystemStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d'); // 1d, 7d, 30d

  // Mock data - replace with actual Firebase/API calls
  useEffect(() => {
    loadSystemData();
  }, [timeRange]);

  const loadSystemData = async () => {
    setRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockStats = {
        totalUsers: 1247,
        activeUsers: 893,
        totalRecords: 5432,
        verifiedRecords: 4891,
        pendingVerifications: 89,
        correctionRequests: 23,
        systemUptime: 99.8,
        dailyRegistrations: 12,
        recordsToday: 45,
        averageVerificationTime: 2.3, // hours
        userGrowth: 15.6, // percentage
        recordGrowth: 8.9,
        verificationRate: 95.2,
        usersByRole: {
          patients: 856,
          doctors: 45,
          management: 32,
          admin: 8
        },
        recordsByStatus: {
          verified: 4891,
          pending: 89,
          rejected: 34,
          correctionRequested: 23
        },
        monthlyActivity: [
          { month: 'Jan', users: 120, records: 450 },
          { month: 'Feb', users: 150, records: 520 },
          { month: 'Mar', users: 180, records: 680 },
          { month: 'Apr', users: 220, records: 750 },
          { month: 'May', users: 280, records: 890 }
        ]
      };

      const mockActivity = [
        {
          id: 1,
          type: 'user_registration',
          description: 'New patient registered: John Doe',
          timestamp: '2024-01-20T10:30:00Z',
          severity: 'info'
        },
        {
          id: 2,
          type: 'record_verification',
          description: 'Dr. Smith verified 5 medical records',
          timestamp: '2024-01-20T09:45:00Z',
          severity: 'success'
        },
        {
          id: 3,
          type: 'correction_request',
          description: 'Patient requested correction for record #1234',
          timestamp: '2024-01-20T09:15:00Z',
          severity: 'warning'
        },
        {
          id: 4,
          type: 'system_backup',
          description: 'Daily system backup completed successfully',
          timestamp: '2024-01-20T02:00:00Z',
          severity: 'success'
        },
        {
          id: 5,
          type: 'failed_login',
          description: 'Multiple failed login attempts detected',
          timestamp: '2024-01-19T23:30:00Z',
          severity: 'error'
        }
      ];

      const mockAlerts = [
        {
          id: 1,
          type: 'warning',
          title: 'High Pending Verifications',
          message: '89 records are pending verification. Consider notifying doctors.',
          timestamp: '2024-01-20T08:00:00Z',
          priority: 'medium'
        },
        {
          id: 2,
          type: 'info',
          title: 'Scheduled Maintenance',
          message: 'System maintenance scheduled for tonight at 2:00 AM',
          timestamp: '2024-01-20T07:30:00Z',
          priority: 'low'
        },
        {
          id: 3,
          type: 'error',
          title: 'Storage Usage Alert',
          message: 'Storage usage has exceeded 85%. Consider upgrading storage.',
          timestamp: '2024-01-20T06:15:00Z',
          priority: 'high'
        }
      ];

      setSystemStats(mockStats);
      setRecentActivity(mockActivity);
      setSystemAlerts(mockAlerts);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const getActivityIcon = (type) => {
    const icons = {
      user_registration: <Users className="w-4 h-4" />,
      record_verification: <CheckCircle className="w-4 h-4" />,
      correction_request: <AlertTriangle className="w-4 h-4" />,
      system_backup: <Shield className="w-4 h-4" />,
      failed_login: <XCircle className="w-4 h-4" />
    };
    return icons[type] || <Activity className="w-4 h-4" />;
  };

  const getActivityColor = (severity) => {
    const colors = {
      info: 'text-blue-500 bg-blue-50',
      success: 'text-green-500 bg-green-50',
      warning: 'text-yellow-500 bg-yellow-50',
      error: 'text-red-500 bg-red-50'
    };
    return colors[severity] || 'text-gray-500 bg-gray-50';
  };

  const getAlertColor = (type) => {
    const colors = {
      info: 'border-blue-200 bg-blue-50',
      warning: 'border-yellow-200 bg-yellow-50',
      error: 'border-red-200 bg-red-50'
    };
    return colors[type] || 'border-gray-200 bg-gray-50';
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      statistics: systemStats,
      recentActivity: recentActivity.slice(0, 10),
      alerts: systemAlerts
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">System Overview</h1>
            <p className="text-gray-600">Monitor system performance and key metrics</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <button
              onClick={loadSystemData}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportReport}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">System Alerts</h2>
          <div className="space-y-3">
            {systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Bell className="w-5 h-5 mt-0.5 text-current" />
                    <div>
                      <h3 className="font-medium text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                    alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{systemStats.totalUsers?.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{systemStats.userGrowth}%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Records</p>
              <p className="text-2xl font-semibold text-gray-900">{systemStats.totalRecords?.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{systemStats.recordGrowth}%</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Verification Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{systemStats.verificationRate}%</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-600">{systemStats.verifiedRecords} verified</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">System Uptime</p>
              <p className="text-2xl font-semibold text-gray-900">{systemStats.systemUptime}%</p>
              <div className="flex items-center mt-2">
                <Activity className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">Operational</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            {Object.entries(systemStats.usersByRole || {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    role === 'patients' ? 'bg-blue-500' :
                    role === 'doctors' ? 'bg-green-500' :
                    role === 'management' ? 'bg-purple-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({((count / systemStats.totalUsers) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Record Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Record Status</h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            {Object.entries(systemStats.recordsByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    status === 'verified' ? 'bg-green-500' :
                    status === 'pending' ? 'bg-yellow-500' :
                    status === 'rejected' ? 'bg-red-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {status.replace(/([A-Z])/g, ' $1')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({((count / systemStats.totalRecords) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Daily Registrations</h3>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{systemStats.dailyRegistrations}</p>
          <p className="text-xs text-gray-500 mt-1">New users today</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Records Today</h3>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{systemStats.recordsToday}</p>
          <p className="text-xs text-gray-500 mt-1">New records entered</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Avg. Verification Time</h3>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{systemStats.averageVerificationTime}h</p>
          <p className="text-xs text-gray-500 mt-1">From submission to verification</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.severity)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {recentActivity.length === 0 && (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">Activity will appear here as it happens.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;