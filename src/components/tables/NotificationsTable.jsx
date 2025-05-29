import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

const NotificationsTable = ({ 
  notifications = [], 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onVerifyRecord, 
  onViewRecord,
  loading = false,
  onRefresh 
}) => {
  const { user } = useAuth();
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all, unread, verification, correction
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority

  // Filter and sort notifications
  const filteredNotifications = notifications
    .filter(notification => {
      switch (filterType) {
        case 'unread':
          return !notification.isRead;
        case 'verification':
          return notification.type === 'record_verification';
        case 'correction':
          return notification.type === 'correction_request';
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priority':
          return (b.priority || 0) - (a.priority || 0);
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleMarkSelectedAsRead = () => {
    selectedNotifications.forEach(id => {
      onMarkAsRead(id);
    });
    setSelectedNotifications([]);
  };

  const getNotificationIcon = (type, priority) => {
    const baseClasses = "w-5 h-5 mr-3 flex-shrink-0";
    
    switch (type) {
      case 'record_verification':
        return (
          <div className={`${baseClasses} rounded-full bg-blue-100 flex items-center justify-center`}>
            <span className="text-blue-600 text-xs">📋</span>
          </div>
        );
      case 'correction_request':
        return (
          <div className={`${baseClasses} rounded-full bg-orange-100 flex items-center justify-center`}>
            <span className="text-orange-600 text-xs">✏️</span>
          </div>
        );
      case 'urgent':
        return (
          <div className={`${baseClasses} rounded-full bg-red-100 flex items-center justify-center`}>
            <span className="text-red-600 text-xs">🚨</span>
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} rounded-full bg-gray-100 flex items-center justify-center`}>
            <span className="text-gray-600 text-xs">📢</span>
          </div>
        );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Low</span>;
      default:
        return null;
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header with Controls */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Notifications ({unreadCount} unread)
            </h3>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                🔄 Refresh
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Dropdown */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="verification">Verification Requests</option>
              <option value="correction">Correction Requests</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">By Priority</option>
            </select>

            {/* Bulk Actions */}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Mark All Read
              </button>
            )}
            
            {selectedNotifications.length > 0 && (
              <button
                onClick={handleMarkSelectedAsRead}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Mark Selected Read ({selectedNotifications.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-lg">No notifications found</p>
            <p className="text-sm">
              {filterType !== 'all' 
                ? `No ${filterType} notifications available` 
                : 'All caught up! No new notifications.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Select All Header */}
            <div className="p-3 bg-gray-50 border-b">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                Select All ({filteredNotifications.length} notifications)
              </label>
            </div>

            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="mt-1"
                  />

                  {/* Icon */}
                  {getNotificationIcon(notification.type, notification.priority)}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        {/* Metadata */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>Patient: {notification.patientName}</span>
                          {notification.recordDate && (
                            <span>Record Date: {new Date(notification.recordDate).toLocaleDateString()}</span>
                          )}
                          <span>{formatTimeAgo(notification.createdAt)}</span>
                        </div>
                      </div>

                      {/* Priority Badge */}
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(notification.priority)}
                        {!notification.isRead && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      {notification.type === 'record_verification' && (
                        <button
                          onClick={() => onVerifyRecord(notification.recordId)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Verify Record
                        </button>
                      )}
                      
                      <button
                        onClick={() => onViewRecord(notification.recordId)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        View Details
                      </button>
                      
                      {!notification.isRead && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="px-3 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer with Statistics */}
      {filteredNotifications.length > 0 && (
        <div className="p-3 bg-gray-50 border-t text-xs text-gray-600 flex justify-between">
          <span>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </span>
          <span>
            {unreadCount} unread • Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificationsTable;