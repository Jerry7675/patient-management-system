import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home, 
  FileText, 
  Users, 
  UserCheck, 
  Settings, 
  Activity,
  Plus,
  Search,
  Edit,
  Bell,
  Shield,
  Database,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle
} from 'lucide-react';

const Sidebar = ({ isCollapsed = false, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState('');

  // Update active item based on current route
  useEffect(() => {
    const path = location.pathname;
    const segments = path.split('/');
    setActiveItem(segments[segments.length - 1] || 'dashboard');
  }, [location]);

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [];

    switch (user?.role) {
      case 'patient':
        return [
          { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: Home, 
            path: '/patient/dashboard',
            description: 'Overview of your health records'
          },
          { 
            id: 'records', 
            label: 'My Records', 
            icon: FileText, 
            path: '/patient/records',
            description: 'View your medical records'
          },
          { 
            id: 'correction', 
            label: 'Request Correction', 
            icon: Edit, 
            path: '/patient/correction',
            description: 'Request changes to your records'
          },
          { 
            id: 'profile', 
            label: 'Profile', 
            icon: Users, 
            path: '/patient/profile',
            description: 'Manage your profile information'
          }
        ];

      case 'doctor':
        return [
          { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: Home, 
            path: '/doctor/dashboard',
            description: 'Your medical practice overview'
          },
          { 
            id: 'verify', 
            label: 'Verify Records', 
            icon: UserCheck, 
            path: '/doctor/verify',
            description: 'Review and verify patient records'
          },
          { 
            id: 'corrections', 
            label: 'Correction Requests', 
            icon: AlertCircle, 
            path: '/doctor/corrections',
            description: 'Handle patient correction requests'
          },
          { 
            id: 'edit', 
            label: 'Edit Records', 
            icon: Edit, 
            path: '/doctor/edit',
            description: 'Edit patient medical records'
          },
          { 
            id: 'notifications', 
            label: 'Notifications', 
            icon: Bell, 
            path: '/doctor/notifications',
            description: 'View system notifications'
          }
        ];

      case 'management':
        return [
          { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: Home, 
            path: '/management/dashboard',
            description: 'Management overview'
          },
          { 
            id: 'add-record', 
            label: 'Add Record', 
            icon: Plus, 
            path: '/management/add-record',
            description: 'Add new patient records'
          },
          { 
            id: 'search', 
            label: 'Patient Search', 
            icon: Search, 
            path: '/management/search',
            description: 'Search for patients'
          },
          { 
            id: 'entry', 
            label: 'Record Entry', 
            icon: Database, 
            path: '/management/entry',
            description: 'Enter medical data'
          }
        ];

      case 'admin':
        return [
          { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: Home, 
            path: '/admin/dashboard',
            description: 'System administration'
          },
          { 
            id: 'verification', 
            label: 'Account Verification', 
            icon: Shield, 
            path: '/admin/verification',
            description: 'Verify user accounts'
          },
          { 
            id: 'users', 
            label: 'User Management', 
            icon: Users, 
            path: '/admin/users',
            description: 'Manage system users'
          },
          { 
            id: 'overview', 
            label: 'System Overview', 
            icon: Activity, 
            path: '/admin/overview',
            description: 'System health and metrics'
          }
        ];

      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const handleNavigation = (item) => {
    navigate(item.path);
    setActiveItem(item.id);
  };

  const getRoleColor = () => {
    const colors = {
      patient: 'bg-blue-100 text-blue-800',
      doctor: 'bg-green-100 text-green-800',
      management: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colors[user?.role] || 'bg-gray-100 text-gray-800';
  };

  if (!user) return null;

  return (
    <div className={`bg-white h-screen shadow-lg border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col`}>
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">PMS</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">PMS</h2>
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor()}`}>
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                </div>
              </div>
            </div>
          )}
          
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-700 font-medium text-sm">
                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.label : item.description}
                >
                  <Icon className={`flex-shrink-0 w-5 h-5 ${
                    isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                  
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-blue-700 rounded-full"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Patient Management System</p>
            <p className="text-xs text-gray-400 mt-1">v1.0.0</p>
          </div>
        </div>
      )}

      {/* Collapsed state indicator */}
      {isCollapsed && (
        <div className="p-2 border-t border-gray-200">
          <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;