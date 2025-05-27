import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const ViewNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, record_verification, correction_request
  const [processingIds, setProcessingIds] = useState(new Set());

  // Real-time notifications listener
  useEffect(() => {
    if (!user?.uid) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('doctorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsList = [];
      querySnapshot.forEach((doc) => {
        notificationsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setNotifications(notificationsList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'record_verification') return notification.type === 'record_verification';
    if (filter === 'correction_request') return notification.type === 'correction_request';
    return true;
  });

  const handleMarkAsRead = async (notificationId) => {
    try {
      setProcessingIds(prev => new Set(prev.add(notificationId)));
      
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Error updating notification');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const unreadNotifications = notifications.filter(n => !n.read);
      
      const updatePromises = unreadNotifications.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), {
          read: true,
          readAt: new Date()
        })
      );

      await Promise.all(updatePromises);
      alert('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      alert('Error updating notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      setProcessingIds(prev => new Set(prev.add(notificationId)));
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Error deleting notification');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleNotificationAction = (notification) => {
    // Mark as read first
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'record_verification') {
      navigate('/doctor/verify-records');
    } else if (notification.type === 'correction_request') {
      navigate('/doctor/correction-requests');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'record_verification':
        return '📋';
      case 'correction_request':
        return '✏️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type, read) => {
    const baseColor = type === 'record_verification' ? 'blue' : 
                     type === 'correction_request' ? 'orange' : 'gray';
    
    return read ? `bg-${baseColor}-50 border-${baseColor}-200` : 
                  `bg-${baseColor}-100 border-${baseColor}-300 ring-2 ring-${baseColor}-500 ring-opacity-50`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </h1>
              <p className="text-gray-600">
                Stay updated with new records and correction requests
              </p>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'all', label: 'All Notifications', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { 
                key: 'record_verification', 
                label: 'Record Verifications', 
                count: notifications.filter(n => n.type === 'record_verification').length 
              },
              { 
                key: 'correction_request', 
                label: 'Correction Requests', 
                count: notifications.filter(n => n.type === 'correction_request').length 
              }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  filter === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
            </h2>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? 'All caught up! No new notifications to review.'
                : 'You haven\'t received any notifications yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-md border-l-4 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  getNotificationColor(notification.type, notification.read)
                }`}
                onClick={() => handleNotificationAction(notification)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-semibold ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        
                        <p className={`mb-2 ${
                          notification.read ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>
                            {new Date(notification.createdAt?.toDate()).toLocaleString()}
                          </span>
                          
                          {notification.patientName && (
                            <span>Patient: {notification.patientName}</span>
                          )}
                          
                          {notification.managementName && (
                            <span>By: {notification.managementName}</span>
                          )}
                        </div>

                        {/* Additional Details */}
                        {notification.recordDetails && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <div className="text-sm space-y-1">
                              {notification.recordDetails.diagnosedDisease && (
                                <div>
                                  <span className="font-medium">Disease: </span>
                                  <span>{notification.recordDetails.diagnosedDisease}</span>
                                </div>
                              )}
                              {notification.recordDetails.date && (
                                <div>
                                  <span className="font-medium">Visit Date: </span>
                                  <span>{notification.recordDetails.date}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Correction Request Details */}
                        {notification.type === 'correction_request' && notification.correctionDetails && (
                          <div className="mt-3 p-3 bg-orange-50 rounded-md">
                            <div className="text-sm">
                              <div className="font-medium text-orange-800 mb-1">
                                Correction Requested:
                              </div>
                              <div className="text-orange-700">
                                {notification.correctionDetails.reason}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          disabled={processingIds.has(notification.id)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        disabled={processingIds.has(notification.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title="Delete notification"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationAction(notification);
                      }}
                      className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                        notification.type === 'record_verification'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {notification.type === 'record_verification' 
                        ? 'Go to Verify Records' 
                        : 'Handle Correction Request'
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {notifications.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => n.type === 'record_verification').length}
                </div>
                <div className="text-sm text-blue-700">Records to Verify</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {notifications.filter(n => n.type === 'correction_request').length}
                </div>
                <div className="text-sm text-orange-700">Correction Requests</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {unreadCount}
                </div>
                <div className="text-sm text-red-700">Unread Notifications</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewNotifications;