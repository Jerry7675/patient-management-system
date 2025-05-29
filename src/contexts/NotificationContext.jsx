import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useUser } from './UserContext';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs 
} from 'firebase/firestore';
import { db } from '../services/firebase/config';

const NotificationContext = createContext();

// Notification types
export const NOTIFICATION_TYPES = {
  RECORD_PENDING_VERIFICATION: 'record_pending_verification',
  RECORD_VERIFIED: 'record_verified',
  RECORD_REJECTED: 'record_rejected',
  CORRECTION_REQUEST: 'correction_request',
  CORRECTION_APPROVED: 'correction_approved',
  CORRECTION_REJECTED: 'correction_rejected',
  ACCOUNT_VERIFIED: 'account_verified',
  ACCOUNT_REJECTED: 'account_rejected',
  NEW_REGISTRATION: 'new_registration',
  SYSTEM_ALERT: 'system_alert'
};

// Notification priorities
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  realTimeEnabled: false
};

// Action types
const ActionTypes = {
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UPDATE_UNREAD_COUNT: 'UPDATE_UNREAD_COUNT',
  ENABLE_REALTIME: 'ENABLE_REALTIME'
};

// Reducer function
function notificationReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
        loading: false
      };

    case ActionTypes.ADD_NOTIFICATION:
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.read).length
      };

    case ActionTypes.UPDATE_NOTIFICATION:
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload.id 
          ? { ...notification, ...action.payload.updates }
          : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      };

    case ActionTypes.MARK_AS_READ:
      const readNotifications = state.notifications.map(notification =>
        notification.id === action.payload 
          ? { ...notification, read: true }
          : notification
      );
      return {
        ...state,
        notifications: readNotifications,
        unreadCount: readNotifications.filter(n => !n.read).length
      };

    case ActionTypes.MARK_ALL_AS_READ:
      const allReadNotifications = state.notifications.map(notification => ({ 
        ...notification, 
        read: true 
      }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0
      };

    case ActionTypes.DELETE_NOTIFICATION:
      const filteredNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.read).length
      };

    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ActionTypes.UPDATE_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload };

    case ActionTypes.ENABLE_REALTIME:
      return { ...state, realTimeEnabled: action.payload };

    default:
      return state;
  }
}

// NotificationProvider component
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, userProfile, isVerified } = useUser();

  // Create notification
  const createNotification = async (notificationData) => {
    try {
      const notification = {
        ...notificationData,
        createdAt: serverTimestamp(),
        read: false,
        id: null // Will be set by Firestore
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Send notification to specific user
  const sendToUser = async (recipientId, recipientRole, type, data) => {
    const notificationData = {
      recipientId,
      recipientRole,
      senderId: user?.uid || null,
      senderRole: userProfile?.role || null,
      type,
      title: getNotificationTitle(type),
      message: getNotificationMessage(type, data),
      data: data || {},
      priority: getNotificationPriority(type),
      actionRequired: requiresAction(type)
    };

    return await createNotification(notificationData);
  };

  // Send notification to all users of a specific role
  const sendToRole = async (recipientRole, type, data) => {
    try {
      // Get all verified users of the specified role
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', recipientRole),
        where('verificationStatus', '==', 'verified')
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const notifications = [];

      for (const userDoc of usersSnapshot.docs) {
        const notificationData = {
          recipientId: userDoc.id,
          recipientRole,
          senderId: user?.uid || null,
          senderRole: userProfile?.role || null,
          type,
          title: getNotificationTitle(type),
          message: getNotificationMessage(type, data),
          data: data || {},
          priority: getNotificationPriority(type),
          actionRequired: requiresAction(type)
        };

        const notificationId = await createNotification(notificationData);
        notifications.push(notificationId);
      }

      return notifications;
    } catch (error) {
      console.error('Error sending notifications to role:', error);
      throw error;
    }
  };

  // Notification helpers
  const getNotificationTitle = (type) => {
    const titles = {
      [NOTIFICATION_TYPES.RECORD_PENDING_VERIFICATION]: 'New Record Needs Verification',
      [NOTIFICATION_TYPES.RECORD_VERIFIED]: 'Medical Record Verified',
      [NOTIFICATION_TYPES.RECORD_REJECTED]: 'Medical Record Rejected',
      [NOTIFICATION_TYPES.CORRECTION_REQUEST]: 'Correction Request Received',
      [NOTIFICATION_TYPES.CORRECTION_APPROVED]: 'Correction Request Approved',
      [NOTIFICATION_TYPES.CORRECTION_REJECTED]: 'Correction Request Rejected',
      [NOTIFICATION_TYPES.ACCOUNT_VERIFIED]: 'Account Verified',
      [NOTIFICATION_TYPES.ACCOUNT_REJECTED]: 'Account Verification Rejected',
      [NOTIFICATION_TYPES.NEW_REGISTRATION]: 'New User Registration',
      [NOTIFICATION_TYPES.SYSTEM_ALERT]: 'System Alert'
    };
    return titles[type] || 'Notification';
  };

  const getNotificationMessage = (type, data) => {
    const messages = {
      [NOTIFICATION_TYPES.RECORD_PENDING_VERIFICATION]: 
        `A new medical record for patient ${data?.patientName || 'Unknown'} requires your verification.`,
      [NOTIFICATION_TYPES.RECORD_VERIFIED]: 
        `Your medical record from ${data?.date || 'recent visit'} has been verified by Dr. ${data?.doctorName || 'Unknown'}.`,
      [NOTIFICATION_TYPES.RECORD_REJECTED]: 
        `Your medical record from ${data?.date || 'recent visit'} was rejected. Reason: ${data?.reason || 'Not specified'}.`,
      [NOTIFICATION_TYPES.CORRECTION_REQUEST]: 
        `Patient ${data?.patientName || 'Unknown'} has requested a correction for their medical record.`,
      [NOTIFICATION_TYPES.CORRECTION_APPROVED]: 
        `Your correction request for the record dated ${data?.date || 'unknown'} has been approved.`,
      [NOTIFICATION_TYPES.CORRECTION_REJECTED]: 
        `Your correction request for the record dated ${data?.date || 'unknown'} has been rejected.`,
      [NOTIFICATION_TYPES.ACCOUNT_VERIFIED]: 
        'Your account has been verified. You can now access all features.',
      [NOTIFICATION_TYPES.ACCOUNT_REJECTED]: 
        `Your account verification was rejected. Reason: ${data?.reason || 'Not specified'}.`,
      [NOTIFICATION_TYPES.NEW_REGISTRATION]: 
        `New ${data?.role || 'user'} registration: ${data?.name || 'Unknown'} requires verification.`,
      [NOTIFICATION_TYPES.SYSTEM_ALERT]: 
        data?.message || 'System notification'
    };
    return messages[type] || 'You have a new notification.';
  };

  const getNotificationPriority = (type) => {
    const priorities = {
      [NOTIFICATION_TYPES.RECORD_PENDING_VERIFICATION]: NOTIFICATION_PRIORITY.HIGH,
      [NOTIFICATION_TYPES.RECORD_VERIFIED]: NOTIFICATION_PRIORITY.MEDIUM,
      [NOTIFICATION_TYPES.RECORD_REJECTED]: NOTIFICATION_PRIORITY.HIGH,
      [NOTIFICATION_TYPES.CORRECTION_REQUEST]: NOTIFICATION_PRIORITY.HIGH,
      [NOTIFICATION_TYPES.CORRECTION_APPROVED]: NOTIFICATION_PRIORITY.MEDIUM,
      [NOTIFICATION_TYPES.CORRECTION_REJECTED]: NOTIFICATION_PRIORITY.MEDIUM,
      [NOTIFICATION_TYPES.ACCOUNT_VERIFIED]: NOTIFICATION_PRIORITY.MEDIUM,
      [NOTIFICATION_TYPES.ACCOUNT_REJECTED]: NOTIFICATION_PRIORITY.HIGH,
      [NOTIFICATION_TYPES.NEW_REGISTRATION]: NOTIFICATION_PRIORITY.MEDIUM,
      [NOTIFICATION_TYPES.SYSTEM_ALERT]: NOTIFICATION_PRIORITY.URGENT
    };
    return priorities[type] || NOTIFICATION_PRIORITY.LOW;
  };

  const requiresAction = (type) => {
    return [
      NOTIFICATION_TYPES.RECORD_PENDING_VERIFICATION,
      NOTIFICATION_TYPES.CORRECTION_REQUEST,
      NOTIFICATION_TYPES.NEW_REGISTRATION
    ].includes(type);
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
      dispatch({ type: ActionTypes.MARK_AS_READ, payload: notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = state.notifications.filter(n => !n.read);
      
      // Update all unread notifications in Firestore
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'notifications', notification.id), {
          read: true,
          readAt: serverTimestamp()
        })
      );
      
      await Promise.all(updatePromises);
      dispatch({ type: ActionTypes.MARK_ALL_AS_READ });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        deleted: true,
        deletedAt: serverTimestamp()
      });
      dispatch({ type: ActionTypes.DELETE_NOTIFICATION, payload: notificationId });
    } catch (error) {
      console.error('Error deleting notification:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Real-time notifications listener
  useEffect(() => {
    if (!user || !userProfile || !isVerified()) return;

    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.ENABLE_REALTIME, payload: true });

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      where('deleted', '!=', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        dispatch({ type: ActionTypes.SET_NOTIFICATIONS, payload: notifications });
      },
      (error) => {
        console.error('Error listening to notifications:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    );

    return unsubscribe;
  }, [user, userProfile]);

  // Context methods for different notification scenarios
  const notificationMethods = {
    // Record-related notifications
    notifyDoctorNewRecord: (doctorId, recordData) => 
      sendToUser(doctorId, 'doctor', NOTIFICATION_TYPES.RECORD_PENDING_VERIFICATION, recordData),
    
    notifyPatientRecordVerified: (patientId, recordData) => 
      sendToUser(patientId, 'patient', NOTIFICATION_TYPES.RECORD_VERIFIED, recordData),
    
    notifyPatientRecordRejected: (patientId, recordData) => 
      sendToUser(patientId, 'patient', NOTIFICATION_TYPES.RECORD_REJECTED, recordData),

    // Correction request notifications
    notifyDoctorCorrectionRequest: (doctorId, correctionData) => 
      sendToUser(doctorId, 'doctor', NOTIFICATION_TYPES.CORRECTION_REQUEST, correctionData),
    
    notifyPatientCorrectionApproved: (patientId, correctionData) => 
      sendToUser(patientId, 'patient', NOTIFICATION_TYPES.CORRECTION_APPROVED, correctionData),
    
    notifyPatientCorrectionRejected: (patientId, correctionData) => 
      sendToUser(patientId, 'patient', NOTIFICATION_TYPES.CORRECTION_REJECTED, correctionData),

    // Account verification notifications
    notifyUserAccountVerified: (userId, userRole) => 
      sendToUser(userId, userRole, NOTIFICATION_TYPES.ACCOUNT_VERIFIED, {}),
    
    notifyUserAccountRejected: (userId, userRole, rejectionData) => 
      sendToUser(userId, userRole, NOTIFICATION_TYPES.ACCOUNT_REJECTED, rejectionData),
    
    notifyAdminsNewRegistration: (userData) => 
      sendToRole('admin', NOTIFICATION_TYPES.NEW_REGISTRATION, userData),

    // System notifications
    sendSystemAlert: (message, targetRole = null) => {
      if (targetRole) {
        return sendToRole(targetRole, NOTIFICATION_TYPES.SYSTEM_ALERT, { message });
      } else {
        // Send to all roles
        const roles = ['patient', 'doctor', 'management', 'admin'];
        return Promise.all(roles.map(role => 
          sendToRole(role, NOTIFICATION_TYPES.SYSTEM_ALERT, { message })
        ));
      }
    }
  };

  const value = {
    ...state,
    
    // Basic notification operations
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    sendToUser,
    sendToRole,
    
    // Convenience methods for specific scenarios
    ...notificationMethods,
    
    // Utility functions
    getNotificationsByType: (type) => 
      state.notifications.filter(n => n.type === type),
    
    getUnreadNotifications: () => 
      state.notifications.filter(n => !n.read),
    
    getNotificationsByPriority: (priority) => 
      state.notifications.filter(n => n.priority === priority),
    
    getActionRequiredNotifications: () => 
      state.notifications.filter(n => n.actionRequired && !n.read),
    
    clearError: () => dispatch({ type: ActionTypes.SET_ERROR, payload: null })
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use the NotificationContext
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;