import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Notification Service - Handles all notification operations
 * Supports real-time notifications for all user roles
 */

// Notification types enum for consistency
export const NOTIFICATION_TYPES = {
  ACCOUNT_VERIFIED: 'account_verified',
  ACCOUNT_REJECTED: 'account_rejected',
  RECORD_ADDED: 'record_added',
  RECORD_VERIFIED: 'record_verified',
  RECORD_REJECTED: 'record_rejected',
  CORRECTION_REQUESTED: 'correction_requested',
  CORRECTION_APPROVED: 'correction_approved',
  CORRECTION_REJECTED: 'correction_rejected',
  ROLE_UPDATED: 'role_updated',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  VERIFICATION_PENDING: 'verification_pending',
  RECORD_UPDATED: 'record_updated',
  PASSWORD_CHANGED: 'password_changed',
  LOGIN_ALERT: 'login_alert'
};

// Create a new notification
export const createNotification = async (notificationData) => {
  try {
    const notification = {
      ...notificationData,
      isRead: false,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), notification);
    
    // Also add to user's notification array for quick access
    if (notificationData.userId) {
      const userRef = doc(db, 'users', notificationData.userId);
      await updateDoc(userRef, {
        notificationIds: arrayUnion(docRef.id),
        unreadNotifications: arrayUnion(docRef.id)
      });
    }
    
    return { success: true, notificationId: docRef.id };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

// Get notifications for a specific user
export const getUserNotifications = async (userId, limitCount = 50) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const notifications = [];
    
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return { success: false, error: error.message };
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('Error fetching unread notifications count:', error);
    return { success: false, error: error.message };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: serverTimestamp()
    });
    
    // Update user's unread notifications array
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      unreadNotifications: arrayRemove(notificationId)
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        isRead: true,
        readAt: serverTimestamp()
      });
    });
    
    // Clear user's unread notifications array
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      unreadNotifications: []
    });
    
    await batch.commit();
    
    return { success: true, updatedCount: snapshot.size };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
};

// Delete a notification
export const deleteNotification = async (notificationId, userId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    
    // Remove from user's notification arrays
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      notificationIds: arrayRemove(notificationId),
      unreadNotifications: arrayRemove(notificationId)
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }
};

// Real-time listener for user notifications
export const subscribeToUserNotifications = (userId, callback) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(notifications);
  });
};

// Specific notification creators for different scenarios

// Notify doctor about new record to verify
export const notifyDoctorNewRecord = async (doctorId, recordData) => {
  return await createNotification({
    userId: doctorId,
    type: NOTIFICATION_TYPES.VERIFICATION_PENDING,
    title: 'New Record Verification Required',
    message: `A new medical record for patient ${recordData.patientName} requires your verification.`,
    metadata: {
      recordId: recordData.id,
      patientId: recordData.patientId,
      patientName: recordData.patientName,
      priority: 'high'
    }
  });
};

// Notify patient about record verification
export const notifyPatientRecordVerified = async (patientId, recordData) => {
  return await createNotification({
    userId: patientId,
    type: NOTIFICATION_TYPES.RECORD_VERIFIED,
    title: 'Medical Record Verified',
    message: `Your medical record from ${recordData.date} has been verified by Dr. ${recordData.doctorName}.`,
    metadata: {
      recordId: recordData.id,
      doctorId: recordData.doctorId,
      doctorName: recordData.doctorName
    }
  });
};

// Notify doctor about correction request
export const notifyDoctorCorrectionRequest = async (doctorId, correctionData) => {
  return await createNotification({
    userId: doctorId,
    type: NOTIFICATION_TYPES.CORRECTION_REQUESTED,
    title: 'Correction Request Received',
    message: `Patient ${correctionData.patientName} has requested a correction for their medical record.`,
    metadata: {
      recordId: correctionData.recordId,
      patientId: correctionData.patientId,
      patientName: correctionData.patientName,
      correctionReason: correctionData.reason,
      priority: 'medium'
    }
  });
};

// Notify patient about correction response
export const notifyPatientCorrectionResponse = async (patientId, correctionData, isApproved) => {
  const status = isApproved ? 'approved' : 'rejected';
  const type = isApproved ? NOTIFICATION_TYPES.CORRECTION_APPROVED : NOTIFICATION_TYPES.CORRECTION_REJECTED;
  
  return await createNotification({
    userId: patientId,
    type: type,
    title: `Correction Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your correction request for the medical record has been ${status}.`,
    metadata: {
      recordId: correctionData.recordId,
      doctorId: correctionData.doctorId,
      response: correctionData.response
    }
  });
};

// Notify management about OTP verification success
export const notifyManagementOTPVerified = async (managementId, patientData) => {
  return await createNotification({
    userId: managementId,
    type: NOTIFICATION_TYPES.RECORD_ADDED,
    title: 'OTP Verified - Ready to Add Record',
    message: `Patient ${patientData.name} has verified OTP. You can now add their medical record.`,
    metadata: {
      patientId: patientData.id,
      patientName: patientData.name,
      patientEmail: patientData.email
    }
  });
};

// Create system-wide notifications (admin only)
export const createSystemNotification = async (adminId, notificationData) => {
  try {
    // Get all verified users
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('isVerified', '==', true));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    const notificationPromises = [];
    
    snapshot.forEach((userDoc) => {
      const notification = {
        userId: userDoc.id,
        type: NOTIFICATION_TYPES.SYSTEM_MAINTENANCE,
        title: notificationData.title,
        message: notificationData.message,
        isRead: false,
        createdAt: serverTimestamp(),
        isSystemWide: true,
        createdBy: adminId
      };
      
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, notification);
    });
    
    await batch.commit();
    
    return { success: true, message: 'System notification sent to all users' };
  } catch (error) {
    console.error('Error creating system notification:', error);
    return { success: false, error: error.message };
  }
};

// Get notification preferences for a user
export const getNotificationPreferences = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const userData = userDoc.data();
    const preferences = userData.notificationPreferences || {
      email: true,
      push: true,
      recordVerification: true,
      correctionRequests: true,
      systemUpdates: true,
      accountChanges: true
    };
    
    return { success: true, data: preferences };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return { success: false, error: error.message };
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      notificationPreferences: preferences,
      preferencesUpdatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return { success: false, error: error.message };
  }
};

// Clean up old notifications (admin function)
export const cleanupOldNotifications = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('createdAt', '<', cutoffDate),
      where('isRead', '==', true)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return { success: true, deletedCount: snapshot.size };
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    return { success: false, error: error.message };
  }
};

// Get notifications by type for analytics
export const getNotificationsByType = async (type, startDate = null, endDate = null) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    let q = query(
      notificationsRef,
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const notifications = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate();
      
      // Filter by date range if provided
      if (startDate && endDate) {
        if (createdAt >= startDate && createdAt <= endDate) {
          notifications.push({
            id: doc.id,
            ...data
          });
        }
      } else {
        notifications.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error fetching notifications by type:', error);
    return { success: false, error: error.message };
  }
};