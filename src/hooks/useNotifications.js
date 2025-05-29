import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { useAuth } from './useAuth';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Real-time notifications listener
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationList = [];
        snapshot.forEach((doc) => {
          notificationList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setNotifications(notificationList);
        
        // Count unread notifications
        const unreadNotifications = notificationList.filter(
          notification => !notification.isRead
        );
        setUnreadCount(unreadNotifications.length);
        
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching notifications:', err);
        setError('Failed to fetch notifications');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Create a new notification
  const createNotification = useCallback(async (notificationData) => {
    try {
      const {
        recipientId,
        recipientRole,
        type,
        title,
        message,
        data = {},
        priority = 'normal'
      } = notificationData;

      const notification = {
        recipientId,
        recipientRole,
        senderId: user?.uid || 'system',
        senderRole: user?.role || 'system',
        type,
        title,
        message,
        data,
        priority,
        isRead: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      return docRef.id;
    } catch (err) {
      console.error('Error creating notification:', err);
      throw new Error('Failed to create notification');
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw new Error('Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'notifications', notification.id), {
          isRead: true,
          readAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      );

      await Promise.all(updatePromises);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw new Error('Failed to mark all notifications as read');
    }
  }, [notifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw new Error('Failed to delete notification');
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      const deletePromises = notifications.map(notification =>
        deleteDoc(doc(db, 'notifications', notification.id))
      );
      
      await Promise.all(deletePromises);
    } catch (err) {
      console.error('Error clearing all notifications:', err);
      throw new Error('Failed to clear all notifications');
    }
  }, [notifications]);

  // Send notification to doctor when new record is added
  const notifyDoctorNewRecord = useCallback(async (recordData) => {
    try {
      await createNotification({
        recipientId: recordData.doctorId,
        recipientRole: 'doctor',
        type: 'new_record',
        title: 'New Medical Record for Verification',
        message: `A new medical record for patient ${recordData.patientName} requires your verification.`,
        data: {
          recordId: recordData.recordId,
          patientId: recordData.patientId,
          patientName: recordData.patientName,
          disease: recordData.disease,
          date: recordData.date
        },
        priority: 'high'
      });
    } catch (err) {
      console.error('Error notifying doctor:', err);
      throw err;
    }
  }, [createNotification]);

  // Send notification to doctor when correction is requested
  const notifyDoctorCorrection = useCallback(async (correctionData) => {
    try {
      await createNotification({
        recipientId: correctionData.doctorId,
        recipientRole: 'doctor',
        type: 'correction_request',
        title: 'Record Correction Request',
        message: `Patient ${correctionData.patientName} has requested a correction to their medical record.`,
        data: {
          recordId: correctionData.recordId,
          patientId: correctionData.patientId,
          patientName: correctionData.patientName,
          correctionReason: correctionData.reason,
          requestedChanges: correctionData.requestedChanges
        },
        priority: 'high'
      });
    } catch (err) {
      console.error('Error notifying doctor about correction:', err);
      throw err;
    }
  }, [createNotification]);

  // Send notification to patient when record is verified
  const notifyPatientRecordVerified = useCallback(async (recordData) => {
    try {
      await createNotification({
        recipientId: recordData.patientId,
        recipientRole: 'patient',
        type: 'record_verified',
        title: 'Medical Record Verified',
        message: `Your medical record from ${recordData.date} has been verified by Dr. ${recordData.doctorName}.`,
        data: {
          recordId: recordData.recordId,
          doctorName: recordData.doctorName,
          disease: recordData.disease,
          date: recordData.date
        },
        priority: 'normal'
      });
    } catch (err) {
      console.error('Error notifying patient:', err);
      throw err;
    }
  }, [createNotification]);

  // Send notification to patient when correction is processed
  const notifyPatientCorrectionProcessed = useCallback(async (correctionData) => {
    try {
      const status = correctionData.approved ? 'approved' : 'rejected';
      await createNotification({
        recipientId: correctionData.patientId,
        recipientRole: 'patient',
        type: 'correction_processed',
        title: `Correction Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your correction request has been ${status} by Dr. ${correctionData.doctorName}.`,
        data: {
          recordId: correctionData.recordId,
          doctorName: correctionData.doctorName,
          status: status,
          response: correctionData.response
        },
        priority: 'normal'
      });
    } catch (err) {
      console.error('Error notifying patient about correction:', err);
      throw err;
    }
  }, [createNotification]);

  // Send notification to admin for account verification
  const notifyAdminAccountVerification = useCallback(async (userData) => {
    try {
      // Get all admin users
      const adminsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'admin')
      );
      
      const adminSnapshot = await getDocs(adminsQuery);
      
      const notificationPromises = [];
      adminSnapshot.forEach((adminDoc) => {
        const adminData = adminDoc.data();
        notificationPromises.push(
          createNotification({
            recipientId: adminData.uid,
            recipientRole: 'admin',
            type: 'account_verification',
            title: 'New Account Verification Required',
            message: `A new ${userData.role} account for ${userData.fullName} requires verification.`,
            data: {
              userId: userData.uid,
              userRole: userData.role,
              fullName: userData.fullName,
              email: userData.email,
              registrationDate: userData.createdAt
            },
            priority: 'high'
          })
        );
      });

      await Promise.all(notificationPromises);
    } catch (err) {
      console.error('Error notifying admins:', err);
      throw err;
    }
  }, [createNotification]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  // Get notifications by priority
  const getNotificationsByPriority = useCallback((priority) => {
    return notifications.filter(notification => notification.priority === priority);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    
    // Basic operations
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    
    // Specific notification creators
    notifyDoctorNewRecord,
    notifyDoctorCorrection,
    notifyPatientRecordVerified,
    notifyPatientCorrectionProcessed,
    notifyAdminAccountVerification,
    
    // Utility functions
    getNotificationsByType,
    getNotificationsByPriority,
    
    // Generic notification creator
    createNotification
  };
};

export default useNotifications;