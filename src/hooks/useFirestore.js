import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../services/firebase/config';
import { useUser } from '../context/UserContext';

// Custom hook for Firestore operations
export function useFirestore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, userProfile } = useUser();

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Generic error handler
  const handleError = useCallback((error, operation) => {
    console.error(`Firestore ${operation} error:`, error);
    setError(`${operation} failed: ${error.message}`);
    setLoading(false);
  }, []);

  // CRUD Operations

  // Create document
  const create = useCallback(async (collectionName, data, customId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        createdBy: user?.uid || null,
        updatedAt: serverTimestamp()
      };

      let docRef;
      if (customId) {
        docRef = doc(db, collectionName, customId);
        await updateDoc(docRef, docData);
      } else {
        docRef = await addDoc(collection(db, collectionName), docData);
      }

      setLoading(false);
      return customId || docRef.id;
    } catch (error) {
      handleError(error, 'create');
      throw error;
    }
  }, [user, handleError]);

  // Read single document
  const getById = useCallback(async (collectionName, docId) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      setLoading(false);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Document not found');
      }
    } catch (error) {
      handleError(error, 'getById');
      return null;
    }
  }, [handleError]);

  // Update document
  const update = useCallback(async (collectionName, docId, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, docId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || null
      };
      
      await updateDoc(docRef, updateData);
      setLoading(false);
      return true;
    } catch (error) {
      handleError(error, 'update');
      throw error;
    }
  }, [user, handleError]);

  // Delete document (soft delete)
  const remove = useCallback(async (collectionName, docId, hardDelete = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, docId);
      
      if (hardDelete) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, {
          deleted: true,
          deletedAt: serverTimestamp(),
          deletedBy: user?.uid || null
        });
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      handleError(error, 'delete');
      throw error;
    }
  }, [user, handleError]);

  // Query Operations

  // Get documents with filtering
  const getWhere = useCallback(async (collectionName, conditions = [], orderByField = null, limitCount = null) => {
    setLoading(true);
    setError(null);
    
    try {
      let q = collection(db, collectionName);
      
      // Add where conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      // Add ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField.field, orderByField.direction || 'asc'));
      }
      
      // Add limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLoading(false);
      return documents;
    } catch (error) {
      handleError(error, 'query');
      return [];
    }
  }, [handleError]);

  // Real-time listener
  const useRealtimeQuery = useCallback((collectionName, conditions = [], orderByField = null, limitCount = null) => {
    const [data, setData] = useState([]);
    const [realtimeLoading, setRealtimeLoading] = useState(true);
    const [realtimeError, setRealtimeError] = useState(null);

    useEffect(() => {
      try {
        let q = collection(db, collectionName);
        
        // Add where conditions
        conditions.forEach(condition => {
          q = query(q, where(condition.field, condition.operator, condition.value));
        });
        
        // Add ordering
        if (orderByField) {
          q = query(q, orderBy(orderByField.field, orderByField.direction || 'asc'));
        }
        
        // Add limit
        if (limitCount) {
          q = query(q, limit(limitCount));
        }

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const documents = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setData(documents);
            setRealtimeLoading(false);
            setRealtimeError(null);
          },
          (error) => {
            console.error('Realtime query error:', error);
            setRealtimeError(error.message);
            setRealtimeLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        setRealtimeError(error.message);
        setRealtimeLoading(false);
      }
    }, [collectionName, JSON.stringify(conditions), JSON.stringify(orderByField), limitCount]);

    return { data, loading: realtimeLoading, error: realtimeError };
  }, []);

  // Medical Records Operations

  // Create medical record
  const createMedicalRecord = useCallback(async (recordData) => {
    try {
      const record = {
        ...recordData,
        status: 'pending_verification',
        verificationStatus: 'pending',
        verifiedBy: null,
        verifiedAt: null,
        patientId: recordData.patientId,
        doctorId: recordData.doctorId,
        managementId: user?.uid,
        recordNumber: `REC-${Date.now()}`,
        createdAt: serverTimestamp()
      };

      const recordId = await create('medicalRecords', record);
      
      // Create activity log
      await create('activityLogs', {
        type: 'record_created',
        recordId: recordId,
        patientId: recordData.patientId,
        performedBy: user?.uid,
        performedByRole: userProfile?.role,
        description: `Medical record created for patient ${recordData.patientName}`,
        metadata: { recordNumber: record.recordNumber }
      });

      return recordId;
    } catch (error) {
      throw error;
    }
  }, [user, userProfile, create]);

  // Verify medical record
  const verifyMedicalRecord = useCallback(async (recordId, verificationData) => {
    try {
      const updateData = {
        status: verificationData.approved ? 'verified' : 'rejected',
        verificationStatus: verificationData.approved ? 'verified' : 'rejected',
        verifiedBy: user?.uid,
        verifiedAt: serverTimestamp(),
        verificationNotes: verificationData.notes || '',
        rejectionReason: verificationData.approved ? null : verificationData.reason
      };

      // Update any edited fields if provided
      if (verificationData.editedData) {
        Object.assign(updateData, verificationData.editedData);
      }

      await update('medicalRecords', recordId, updateData);
      
      // Create activity log
      await create('activityLogs', {
        type: verificationData.approved ? 'record_verified' : 'record_rejected',
        recordId: recordId,
        performedBy: user?.uid,
        performedByRole: userProfile?.role,
        description: `Medical record ${verificationData.approved ? 'verified' : 'rejected'} by Dr. ${userProfile?.name}`,
        metadata: { 
          notes: verificationData.notes,
          reason: verificationData.reason 
        }
      });

      return true;
    } catch (error) {
      throw error;
    }
  }, [user, userProfile, update, create]);

  // Patient Operations

  // Get patient records
  const getPatientRecords = useCallback(async (patientId, includeUnverified = false) => {
    const conditions = [
      { field: 'patientId', operator: '==', value: patientId },
      { field: 'deleted', operator: '!=', value: true }
    ];

    if (!includeUnverified) {
      conditions.push({ field: 'verificationStatus', operator: '==', value: 'verified' });
    }

    return await getWhere('medicalRecords', conditions, { field: 'createdAt', direction: 'desc' });
  }, [getWhere]);

  // Request correction
  const requestCorrection = useCallback(async (recordId, correctionData) => {
    try {
      const correctionRequest = {
        recordId: recordId,
        patientId: user?.uid,
        requestType: 'correction',
        requestedChanges: correctionData.changes,
        reason: correctionData.reason,
        status: 'pending',
        priority: correctionData.priority || 'medium'
      };

      const requestId = await create('correctionRequests', correctionRequest);

      // Create activity log
      await create('activityLogs', {
        type: 'correction_requested',
        recordId: recordId,
        patientId: user?.uid,
        performedBy: user?.uid,
        performedByRole: userProfile?.role,
        description: `Correction requested for medical record`,
        metadata: { 
          requestId: requestId,
          reason: correctionData.reason 
        }
      });

      return requestId;
    } catch (error) {
      throw error;
    }
  }, [user, userProfile, create]);

  // Doctor Operations

  // Get pending verifications for doctor
  const getPendingVerifications = useCallback(async (doctorId) => {
    return await getWhere('medicalRecords', [
      { field: 'doctorId', operator: '==', value: doctorId },
      { field: 'verificationStatus', operator: '==', value: 'pending' },
      { field: 'deleted', operator: '!=', value: true }
    ], { field: 'createdAt', direction: 'asc' });
  }, [getWhere]);

  // Get correction requests for doctor
  const getCorrectionRequests = useCallback(async (doctorId) => {
    // First get the correction requests
    const requests = await getWhere('correctionRequests', [
      { field: 'status', operator: '==', value: 'pending' }
    ]);

    // Filter requests that belong to records verified by this doctor
    const doctorRequests = [];
    for (const request of requests) {
      const record = await getById('medicalRecords', request.recordId);
      if (record && record.verifiedBy === doctorId) {
        doctorRequests.push({
          ...request,
          record: record
        });
      }
    }

    return doctorRequests;
  }, [getWhere, getById]);

  // Admin Operations

  // Get pending user verifications
  const getPendingUserVerifications = useCallback(async () => {
    return await getWhere('users', [
      { field: 'verificationStatus', operator: '==', value: 'pending' }
    ], { field: 'createdAt', direction: 'asc' });
  }, [getWhere]);

  // Verify user account
  const verifyUserAccount = useCallback(async (userId, approved, reason = null) => {
    try {
      const updateData = {
        verificationStatus: approved ? 'verified' : 'rejected',
        verifiedBy: user?.uid,
        verifiedAt: serverTimestamp(),
        verificationReason: reason
      };

      await update('users', userId, updateData);

      // Create activity log
      await create('activityLogs', {
        type: approved ? 'account_verified' : 'account_rejected',
        targetUserId: userId,
        performedBy: user?.uid,
        performedByRole: userProfile?.role,
        description: `User account ${approved ? 'verified' : 'rejected'}`,
        metadata: { reason: reason }
      });

      return true;
    } catch (error) {
      throw error;
    }
  }, [user, userProfile, update, create]);

  // File Upload Operations

  // Upload file to Firebase Storage
  const uploadFile = useCallback(async (file, path) => {
    setLoading(true);
    setError(null);
    
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setLoading(false);
      return {
        url: downloadURL,
        path: path,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      handleError(error, 'file upload');
      throw error;
    }
  }, [handleError]);

  // Delete file from Firebase Storage
  const deleteFile = useCallback(async (filePath) => {
    try {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }, []);

  // Batch Operations

  // Batch update multiple documents
  const batchUpdate = useCallback(async (updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ collection: collectionName, docId, data }) => {
        const docRef = doc(db, collectionName, docId);
        batch.update(docRef, {
          ...data,
          updatedAt: serverTimestamp(),
          updatedBy: user?.uid || null
        });
      });
      
      await batch.commit();
      setLoading(false);
      return true;
    } catch (error) {
      handleError(error, 'batch update');
      throw error;
    }
  }, [user, handleError]);

  // Statistics and Analytics

  // Get system statistics
  const getSystemStats = useCallback(async () => {
    try {
      const [
        totalPatients,
        totalDoctors,
        totalRecords,
        pendingVerifications,
        pendingUsers
      ] = await Promise.all([
        getWhere('users', [{ field: 'role', operator: '==', value: 'patient' }]),
        getWhere('users', [{ field: 'role', operator: '==', value: 'doctor' }]),
        getWhere('medicalRecords', [{ field: 'deleted', operator: '!=', value: true }]),
        getWhere('medicalRecords', [{ field: 'verificationStatus', operator: '==', value: 'pending' }]),
        getWhere('users', [{ field: 'verificationStatus', operator: '==', value: 'pending' }])
      ]);

      return {
        totalPatients: totalPatients.length,
        totalDoctors: totalDoctors.length,
        totalRecords: totalRecords.length,
        pendingVerifications: pendingVerifications.length,
        pendingUsers: pendingUsers.length,
        verifiedRecords: totalRecords.filter(r => r.verificationStatus === 'verified').length,
        rejectedRecords: totalRecords.filter(r => r.verificationStatus === 'rejected').length
      };
    } catch (error) {
      handleError(error, 'get statistics');
      return null;
    }
  }, [getWhere, handleError]);

  return {
    // State
    loading,
    error,
    clearError,

    // Basic CRUD
    create,
    getById,
    update,
    remove,
    getWhere,
    useRealtimeQuery,

    // Medical Records
    createMedicalRecord,
    verifyMedicalRecord,
    getPatientRecords,
    requestCorrection,

    // Doctor Operations
    getPendingVerifications,
    getCorrectionRequests,

    // Admin Operations
    getPendingUserVerifications,
    verifyUserAccount,

    // File Operations
    uploadFile,
    deleteFile,

    // Batch Operations
    batchUpdate,

    // Analytics
    getSystemStats
  };
}

export default useFirestore;