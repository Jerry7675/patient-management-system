import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { deleteUser, getAuth } from 'firebase/auth';
import { db } from '../firebase/config';

/**
 * Admin Service - Handles all admin operations
 * Including user management, account verification, and system oversight
 */

// Get all pending user accounts for verification
export const getPendingUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('isVerified', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const pendingUsers = [];
    
    snapshot.forEach((doc) => {
      pendingUsers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: pendingUsers };
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return { success: false, error: error.message };
  }
};

// Get all verified users
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    const users = [];
    
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching all users:', error);
    return { success: false, error: error.message };
  }
};

// Verify a user account
export const verifyUserAccount = async (userId, adminId) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      isVerified: true,
      verifiedBy: adminId,
      verifiedAt: serverTimestamp()
    });
    
    // Create notification for user
    await addDoc(collection(db, 'notifications'), {
      userId: userId,
      type: 'account_verified',
      title: 'Account Verified',
      message: 'Your account has been verified by admin. You can now access the system.',
      isRead: false,
      createdAt: serverTimestamp()
    });
    
    return { success: true, message: 'User account verified successfully' };
  } catch (error) {
    console.error('Error verifying user account:', error);
    return { success: false, error: error.message };
  }
};

// Reject a user account
export const rejectUserAccount = async (userId, reason, adminId) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      isVerified: false,
      isRejected: true,
      rejectionReason: reason,
      rejectedBy: adminId,
      rejectedAt: serverTimestamp()
    });
    
    // Create notification for user
    await addDoc(collection(db, 'notifications'), {
      userId: userId,
      type: 'account_rejected',
      title: 'Account Rejected',
      message: `Your account verification was rejected. Reason: ${reason}`,
      isRead: false,
      createdAt: serverTimestamp()
    });
    
    return { success: true, message: 'User account rejected' };
  } catch (error) {
    console.error('Error rejecting user account:', error);
    return { success: false, error: error.message };
  }
};

// Delete a user account
export const deleteUserAccount = async (userId) => {
  try {
    // Delete user document from Firestore
    await deleteDoc(doc(db, 'users', userId));
    
    // Note: Deleting from Firebase Auth requires admin SDK on backend
    // For now, we'll just mark as deleted in Firestore
    
    return { success: true, message: 'User account deleted successfully' };
  } catch (error) {
    console.error('Error deleting user account:', error);
    return { success: false, error: error.message };
  }
};

// Get user statistics for dashboard
export const getUserStatistics = async () => {
  try {
    const usersRef = collection(db, 'users');
    const allUsersSnapshot = await getDocs(usersRef);
    
    const stats = {
      total: 0,
      verified: 0,
      pending: 0,
      rejected: 0,
      byRole: {
        patient: 0,
        doctor: 0,
        management: 0,
        admin: 0
      }
    };
    
    allUsersSnapshot.forEach((doc) => {
      const userData = doc.data();
      stats.total++;
      
      if (userData.isVerified) {
        stats.verified++;
      } else if (userData.isRejected) {
        stats.rejected++;
      } else {
        stats.pending++;
      }
      
      if (userData.role && stats.byRole.hasOwnProperty(userData.role)) {
        stats.byRole[userData.role]++;
      }
    });
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return { success: false, error: error.message };
  }
};

// Get system activity statistics
export const getSystemActivity = async () => {
  try {
    // Get recent records
    const recordsRef = collection(db, 'medicalRecords');
    const recentRecordsQuery = query(
      recordsRef, 
      orderBy('createdAt', 'desc')
    );
    const recordsSnapshot = await getDocs(recentRecordsQuery);
    
    // Get recent notifications
    const notificationsRef = collection(db, 'notifications');
    const recentNotificationsQuery = query(
      notificationsRef, 
      orderBy('createdAt', 'desc')
    );
    const notificationsSnapshot = await getDocs(recentNotificationsQuery);
    
    const activity = {
      totalRecords: recordsSnapshot.size,
      totalNotifications: notificationsSnapshot.size,
      recentActivity: []
    };
    
    // Combine recent records and notifications for activity feed
    const recentRecords = [];
    recordsSnapshot.forEach((doc) => {
      const data = doc.data();
      recentRecords.push({
        type: 'record',
        timestamp: data.createdAt,
        description: `Medical record created for patient ${data.patientName}`
      });
    });
    
    const recentNotifications = [];
    notificationsSnapshot.forEach((doc) => {
      const data = doc.data();
      recentNotifications.push({
        type: 'notification',
        timestamp: data.createdAt,
        description: data.message
      });
    });
    
    // Sort combined activity by timestamp and take latest 20
    activity.recentActivity = [...recentRecords, ...recentNotifications]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
    
    return { success: true, data: activity };
  } catch (error) {
    console.error('Error fetching system activity:', error);
    return { success: false, error: error.message };
  }
};

// Update user role (admin privilege)
export const updateUserRole = async (userId, newRole, adminId) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      role: newRole,
      roleUpdatedBy: adminId,
      roleUpdatedAt: serverTimestamp()
    });
    
    // Create notification for user
    await addDoc(collection(db, 'notifications'), {
      userId: userId,
      type: 'role_updated',
      title: 'Role Updated',
      message: `Your role has been updated to ${newRole} by admin.`,
      isRead: false,
      createdAt: serverTimestamp()
    });
    
    return { success: true, message: 'User role updated successfully' };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message };
  }
};

// Get detailed user information
export const getUserDetails = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const userData = { id: userDoc.id, ...userDoc.data() };
    
    // Get user's medical records if patient
    if (userData.role === 'patient') {
      const recordsRef = collection(db, 'medicalRecords');
      const recordsQuery = query(
        recordsRef, 
        where('patientId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const recordsSnapshot = await getDocs(recordsQuery);
      
      userData.medicalRecords = [];
      recordsSnapshot.forEach((doc) => {
        userData.medicalRecords.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }
    
    return { success: true, data: userData };
  } catch (error) {
    console.error('Error fetching user details:', error);
    return { success: false, error: error.message };
  }
};

// Real-time listener for pending users (for notifications)
export const subscribeToPendingUsers = (callback) => {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef, 
    where('isVerified', '==', false),
    where('isRejected', '!=', true)
  );
  
  return onSnapshot(q, (snapshot) => {
    const pendingUsers = [];
    snapshot.forEach((doc) => {
      pendingUsers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(pendingUsers);
  });
};

// Bulk verify users
export const bulkVerifyUsers = async (userIds, adminId) => {
  try {
    const promises = userIds.map(userId => verifyUserAccount(userId, adminId));
    await Promise.all(promises);
    
    return { success: true, message: `${userIds.length} users verified successfully` };
  } catch (error) {
    console.error('Error bulk verifying users:', error);
    return { success: false, error: error.message };
  }
};

// Search users by email, name, or role
export const searchUsers = async (searchTerm, role = null) => {
  try {
    const usersRef = collection(db, 'users');
    let q;
    
    if (role) {
      q = query(
        usersRef,
        where('role', '==', role),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(usersRef, orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    const users = [];
    
    snapshot.forEach((doc) => {
      const userData = doc.data();
      const searchableText = `${userData.name} ${userData.email} ${userData.role}`.toLowerCase();
      
      if (searchableText.includes(searchTerm.toLowerCase())) {
        users.push({
          id: doc.id,
          ...userData
        });
      }
    });
    
    return { success: true, data: users };
  } catch (error) {
    console.error('Error searching users:', error);
    return { success: false, error: error.message };
  }
};