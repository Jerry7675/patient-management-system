// src/services/api/doctorService.js
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { notificationService } from './notificationService';

export const doctorService = {
  // Get all unverified records for a doctor
  async getUnverifiedRecords(doctorId) {
    try {
      const recordsRef = collection(db, 'medicalRecords');
      const q = query(
        recordsRef, 
        where('doctorId', '==', doctorId),
        where('isVerified', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to fetch unverified records: ${error.message}`);
    }
  },

  // Get all verified records for a doctor
  async getVerifiedRecords(doctorId) {
    try {
      const recordsRef = collection(db, 'medicalRecords');
      const q = query(
        recordsRef, 
        where('doctorId', '==', doctorId),
        where('isVerified', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to fetch verified records: ${error.message}`);
    }
  },

  // Verify a medical record
  async verifyRecord(recordId, doctorId) {
    try {
      const recordRef = doc(db, 'medicalRecords', recordId);
      const recordDoc = await getDoc(recordRef);
      
      if (!recordDoc.exists()) {
        throw new Error('Record not found');
      }

      const recordData = recordDoc.data();
      
      await updateDoc(recordRef, {
        isVerified: true,
        verifiedAt: serverTimestamp(),
        verifiedBy: doctorId,
        updatedAt: serverTimestamp()
      });

      // Send notification to patient
      await notificationService.createNotification({
        userId: recordData.patientId,
        userType: 'patient',
        type: 'record_verified',
        title: 'Medical Record Verified',
        message: `Your medical record from ${recordData.date} has been verified and is now available.`,
        recordId: recordId,
        createdAt: serverTimestamp()
      });

      return { success: true, message: 'Record verified successfully' };
    } catch (error) {
      throw new Error(`Failed to verify record: ${error.message}`);
    }
  },

  // Edit a medical record
  async editRecord(recordId, updates, doctorId) {
    try {
      const recordRef = doc(db, 'medicalRecords', recordId);
      const recordDoc = await getDoc(recordRef);
      
      if (!recordDoc.exists()) {
        throw new Error('Record not found');
      }

      const updateData = {
        ...updates,
        editedBy: doctorId,
        editedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // If editing, mark as unverified and require re-verification
        isVerified: false,
        verifiedAt: null,
        verifiedBy: null
      };

      await updateDoc(recordRef, updateData);

      const recordData = recordDoc.data();
      
      // Send notification to patient about record update
      await notificationService.createNotification({
        userId: recordData.patientId,
        userType: 'patient',
        type: 'record_updated',
        title: 'Medical Record Updated',
        message: `Your medical record from ${recordData.date} has been updated by Dr. ${updates.doctorName || recordData.doctorName}.`,
        recordId: recordId,
        createdAt: serverTimestamp()
      });

      return { success: true, message: 'Record updated successfully' };
    } catch (error) {
      throw new Error(`Failed to update record: ${error.message}`);
    }
  },

  // Get correction requests for doctor
  async getCorrectionRequests(doctorId) {
    try {
      const correctionsRef = collection(db, 'correctionRequests');
      const q = query(
        correctionsRef,
        where('doctorId', '==', doctorId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const requests = [];
      
      for (const docSnap of snapshot.docs) {
        const requestData = docSnap.data();
        
        // Get patient details
        const patientRef = doc(db, 'users', requestData.patientId);
        const patientDoc = await getDoc(patientRef);
        
        // Get record details
        const recordRef = doc(db, 'medicalRecords', requestData.recordId);
        const recordDoc = await getDoc(recordRef);
        
        requests.push({
          id: docSnap.id,
          ...requestData,
          patientName: patientDoc.exists() ? patientDoc.data().name : 'Unknown Patient',
          recordDate: recordDoc.exists() ? recordDoc.data().date : 'Unknown Date'
        });
      }
      
      return requests;
    } catch (error) {
      throw new Error(`Failed to fetch correction requests: ${error.message}`);
    }
  },

  // Respond to correction request
  async respondToCorrectionRequest(requestId, response, doctorId) {
    try {
      const requestRef = doc(db, 'correctionRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Correction request not found');
      }

      const requestData = requestDoc.data();
      
      await updateDoc(requestRef, {
        status: response.action, // 'approved' or 'rejected'
        doctorResponse: response.message,
        respondedAt: serverTimestamp(),
        respondedBy: doctorId
      });

      // If approved, update the medical record
      if (response.action === 'approved' && response.corrections) {
        const recordRef = doc(db, 'medicalRecords', requestData.recordId);
        await updateDoc(recordRef, {
          ...response.corrections,
          updatedAt: serverTimestamp(),
          correctedAt: serverTimestamp(),
          correctedBy: doctorId,
          // Mark as unverified after correction
          isVerified: false,
          verifiedAt: null,
          verifiedBy: null
        });
      }

      // Send notification to patient
      const notificationTitle = response.action === 'approved' 
        ? 'Correction Request Approved' 
        : 'Correction Request Reviewed';
      
      const notificationMessage = response.action === 'approved'
        ? 'Your correction request has been approved and the record has been updated.'
        : `Your correction request has been reviewed. Doctor's response: ${response.message}`;

      await notificationService.createNotification({
        userId: requestData.patientId,
        userType: 'patient',
        type: 'correction_response',
        title: notificationTitle,
        message: notificationMessage,
        recordId: requestData.recordId,
        createdAt: serverTimestamp()
      });

      return { success: true, message: 'Response sent successfully' };
    } catch (error) {
      throw new Error(`Failed to respond to correction request: ${error.message}`);
    }
  },

  // Get doctor's notifications
  async getNotifications(doctorId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', doctorId),
        where('userType', '==', 'doctor'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  },

  // Get doctor dashboard statistics
  async getDashboardStats(doctorId) {
    try {
      const recordsRef = collection(db, 'medicalRecords');
      
      // Get unverified records count
      const unverifiedQuery = query(
        recordsRef,
        where('doctorId', '==', doctorId),
        where('isVerified', '==', false)
      );
      const unverifiedSnapshot = await getDocs(unverifiedQuery);
      
      // Get total records count
      const totalQuery = query(recordsRef, where('doctorId', '==', doctorId));
      const totalSnapshot = await getDocs(totalQuery);
      
      // Get correction requests count
      const correctionsRef = collection(db, 'correctionRequests');
      const correctionsQuery = query(
        correctionsRef,
        where('doctorId', '==', doctorId),
        where('status', '==', 'pending')
      );
      const correctionsSnapshot = await getDocs(correctionsQuery);
      
      // Get unread notifications count
      const notificationsRef = collection(db, 'notifications');
      const notificationsQuery = query(
        notificationsRef,
        where('userId', '==', doctorId),
        where('userType', '==', 'doctor'),
        where('isRead', '==', false)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      
      return {
        totalRecords: totalSnapshot.size,
        unverifiedRecords: unverifiedSnapshot.size,
        verifiedRecords: totalSnapshot.size - unverifiedSnapshot.size,
        pendingCorrections: correctionsSnapshot.size,
        unreadNotifications: notificationsSnapshot.size
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard statistics: ${error.message}`);
    }
  },

  // Listen to real-time updates for notifications
  subscribeToNotifications(doctorId, callback) {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', doctorId),
      where('userType', '==', 'doctor'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    });
  },

  // Listen to real-time updates for unverified records
  subscribeToUnverifiedRecords(doctorId, callback) {
    const recordsRef = collection(db, 'medicalRecords');
    const q = query(
      recordsRef,
      where('doctorId', '==', doctorId),
      where('isVerified', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(records);
    });
  }
};

export default doctorService;