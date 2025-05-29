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
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { useAuth } from './useAuth';
import useNotifications from './useNotifications';

const useRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingRecords, setPendingRecords] = useState([]);
  const [verifiedRecords, setVerifiedRecords] = useState([]);
  
  const { user } = useAuth();
  const { 
    notifyDoctorNewRecord, 
    notifyPatientRecordVerified,
    notifyDoctorCorrection,
    notifyPatientCorrectionProcessed
  } = useNotifications();

  // Fetch records based on user role
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    let q;
    const recordsRef = collection(db, 'medicalRecords');

    // Build query based on user role
    switch (user.role) {
      case 'patient':
        q = query(
          recordsRef,
          where('patientId', '==', user.uid),
          where('isVerified', '==', true),
          orderBy('date', 'desc')
        );
        break;
      case 'doctor':
        q = query(
          recordsRef,
          where('doctorId', '==', user.uid),
          orderBy('date', 'desc')
        );
        break;
      case 'management':
        q = query(
          recordsRef,
          where('enteredBy', '==', user.uid),
          orderBy('date', 'desc')
        );
        break;
      case 'admin':
        q = query(recordsRef, orderBy('date', 'desc'));
        break;
      default:
        setLoading(false);
        return;
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const recordsList = [];
        snapshot.forEach((doc) => {
          recordsList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setRecords(recordsList);
        
        // Separate pending and verified records for doctors
        if (user.role === 'doctor') {
          setPendingRecords(recordsList.filter(record => !record.isVerified));
          setVerifiedRecords(recordsList.filter(record => record.isVerified));
        }
        
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching records:', err);
        setError('Failed to fetch records');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, user?.role]);

  // Create a new medical record (Management only)
  const createRecord = useCallback(async (recordData) => {
    try {
      if (user?.role !== 'management') {
        throw new Error('Only management can create records');
      }

      const record = {
        patientId: recordData.patientId,
        patientName: recordData.patientName,
        doctorId: recordData.doctorId,
        doctorName: recordData.doctorName,
        date: recordData.date,
        diagnosedDisease: recordData.diagnosedDisease,
        symptoms: recordData.symptoms || [],
        reportImages: recordData.reportImages || [],
        prescriptions: recordData.prescriptions || [],
        recommendations: recordData.recommendations || '',
        caseStatus: recordData.caseStatus || 'stable', // improving, stable, deteriorating
        vitalSigns: recordData.vitalSigns || {},
        labResults: recordData.labResults || {},
        notes: recordData.notes || '',
        
        // System fields
        enteredBy: user.uid,
        enteredByName: user.displayName || user.email,
        isVerified: false,
        verifiedBy: null,
        verifiedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Correction tracking
        correctionRequests: [],
        hasActiveCorrection: false
      };

      const docRef = await addDoc(collection(db, 'medicalRecords'), record);
      
      // Notify doctor about new record
      await notifyDoctorNewRecord({
        recordId: docRef.id,
        patientId: record.patientId,
        patientName: record.patientName,
        doctorId: record.doctorId,
        disease: record.diagnosedDisease,
        date: record.date
      });

      return docRef.id;
    } catch (err) {
      console.error('Error creating record:', err);
      throw new Error('Failed to create medical record');
    }
  }, [user, notifyDoctorNewRecord]);

  // Update/Edit record (Doctor only)
  const updateRecord = useCallback(async (recordId, updateData) => {
    try {
      if (user?.role !== 'doctor') {
        throw new Error('Only doctors can update records');
      }

      const recordRef = doc(db, 'medicalRecords', recordId);
      const updatePayload = {
        ...updateData,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        lastModifiedByName: user.displayName || user.email
      };

      await updateDoc(recordRef, updatePayload);
      
      return recordId;
    } catch (err) {
      console.error('Error updating record:', err);
      throw new Error('Failed to update medical record');
    }
  }, [user]);

  // Verify record (Doctor only)
  const verifyRecord = useCallback(async (recordId) => {
    try {
      if (user?.role !== 'doctor') {
        throw new Error('Only doctors can verify records');
      }

      const recordRef = doc(db, 'medicalRecords', recordId);
      const recordDoc = await getDoc(recordRef);
      
      if (!recordDoc.exists()) {
        throw new Error('Record not found');
      }

      const recordData = recordDoc.data();

      await updateDoc(recordRef, {
        isVerified: true,
        verifiedBy: user.uid,
        verifiedByName: user.displayName || user.email,
        verifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Notify patient about verification
      await notifyPatientRecordVerified({
        recordId,
        patientId: recordData.patientId,
        doctorName: user.displayName || user.email,
        disease: recordData.diagnosedDisease,
        date: recordData.date
      });

      return recordId;
    } catch (err) {
      console.error('Error verifying record:', err);
      throw new Error('Failed to verify record');
    }
  }, [user, notifyPatientRecordVerified]);

  // Request correction (Patient only)
  const requestCorrection = useCallback(async (recordId, correctionData) => {
    try {
      if (user?.role !== 'patient') {
        throw new Error('Only patients can request corrections');
      }

      const recordRef = doc(db, 'medicalRecords', recordId);
      const recordDoc = await getDoc(recordRef);
      
      if (!recordDoc.exists()) {
        throw new Error('Record not found');
      }

      const recordData = recordDoc.data();
      
      if (recordData.patientId !== user.uid) {
        throw new Error('You can only request corrections for your own records');
      }

      const correctionRequest = {
        id: Date.now().toString(),
        requestedBy: user.uid,
        requestedByName: user.displayName || user.email,
        reason: correctionData.reason,
        requestedChanges: correctionData.requestedChanges,
        description: correctionData.description,
        status: 'pending', // pending, approved, rejected
        createdAt: serverTimestamp(),
        processedBy: null,
        processedAt: null,
        response: null
      };

      await updateDoc(recordRef, {
        correctionRequests: arrayUnion(correctionRequest),
        hasActiveCorrection: true,
        updatedAt: serverTimestamp()
      });

      // Notify doctor about correction request
      await notifyDoctorCorrection({
        recordId,
        patientId: user.uid,
        patientName: user.displayName || user.email,
        doctorId: recordData.doctorId,
        reason: correctionData.reason,
        requestedChanges: correctionData.requestedChanges
      });

      return correctionRequest.id;
    } catch (err) {
      console.error('Error requesting correction:', err);
      throw new Error('Failed to request correction');
    }
  }, [user, notifyDoctorCorrection]);

  // Process correction request (Doctor only)
  const processCorrectionRequest = useCallback(async (recordId, correctionId, decision) => {
    try {
      if (user?.role !== 'doctor') {
        throw new Error('Only doctors can process correction requests');
      }

      const recordRef = doc(db, 'medicalRecords', recordId);
      const recordDoc = await getDoc(recordRef);
      
      if (!recordDoc.exists()) {
        throw new Error('Record not found');
      }

      const recordData = recordDoc.data();
      const correctionRequests = recordData.correctionRequests || [];
      
      const updatedRequests = correctionRequests.map(request => {
        if (request.id === correctionId) {
          return {
            ...request,
            status: decision.approved ? 'approved' : 'rejected',
            processedBy: user.uid,
            processedByName: user.displayName || user.email,
            processedAt: serverTimestamp(),
            response: decision.response
          };
        }
        return request;
      });

      // Check if there are any remaining pending corrections
      const hasActivePending = updatedRequests.some(req => req.status === 'pending');

      await updateDoc(recordRef, {
        correctionRequests: updatedRequests,
        hasActiveCorrection: hasActivePending,
        updatedAt: serverTimestamp()
      });

      // If approved, apply the changes to the record
      if (decision.approved && decision.updatedFields) {
        await updateDoc(recordRef, {
          ...decision.updatedFields,
          updatedAt: serverTimestamp(),
          lastModifiedBy: user.uid,
          lastModifiedByName: user.displayName || user.email
        });
      }

      // Notify patient about decision
      await notifyPatientCorrectionProcessed({
        recordId,
        patientId: recordData.patientId,
        doctorName: user.displayName || user.email,
        approved: decision.approved,
        response: decision.response
      });

      return correctionId;
    } catch (err) {
      console.error('Error processing correction request:', err);
      throw new Error('Failed to process correction request');
    }
  }, [user, notifyPatientCorrectionProcessed]);

  // Get single record
  const getRecord = useCallback(async (recordId) => {
    try {
      const recordRef = doc(db, 'medicalRecords', recordId);
      const recordDoc = await getDoc(recordRef);
      
      if (!recordDoc.exists()) {
        throw new Error('Record not found');
      }

      return {
        id: recordDoc.id,
        ...recordDoc.data()
      };
    } catch (err) {
      console.error('Error fetching record:', err);
      throw new Error('Failed to fetch record');
    }
  }, []);

  // Search records (Admin/Management)
  const searchRecords = useCallback(async (searchCriteria) => {
    try {
      if (!['admin', 'management', 'doctor'].includes(user?.role)) {
        throw new Error('Insufficient permissions to search records');
      }

      const recordsRef = collection(db, 'medicalRecords');
      let q = query(recordsRef);

      // Apply search filters
      if (searchCriteria.patientId) {
        q = query(q, where('patientId', '==', searchCriteria.patientId));
      }
      if (searchCriteria.doctorId) {
        q = query(q, where('doctorId', '==', searchCriteria.doctorId));
      }
      if (searchCriteria.disease) {
        q = query(q, where('diagnosedDisease', '>=', searchCriteria.disease));
      }

      const snapshot = await getDocs(q);
      const results = [];
      
      snapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return results;
    } catch (err) {
      console.error('Error searching records:', err);
      throw new Error('Failed to search records');
    }
  }, [user]);

  // Get records with pending corrections (Doctor only)
  const getRecordsWithPendingCorrections = useCallback(() => {
    if (user?.role !== 'doctor') return [];
    
    return records.filter(record => 
      record.hasActiveCorrection && 
      record.correctionRequests?.some(req => req.status === 'pending')
    );
  }, [records, user?.role]);

  // Get patient records history (for authorized users)
  const getPatientRecordsHistory = useCallback(async (patientId) => {
    try {
      if (!['doctor', 'admin', 'management'].includes(user?.role) && user?.uid !== patientId) {
        throw new Error('Unauthorized to access patient records');
      }

      const recordsRef = collection(db, 'medicalRecords');
      const q = query(
        recordsRef,
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const history = [];
      
      snapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return history;
    } catch (err) {
      console.error('Error fetching patient history:', err);
      throw new Error('Failed to fetch patient records history');
    }
  }, [user]);

  return {
    // State
    records,
    pendingRecords,
    verifiedRecords,
    loading,
    error,
    
    // Record management
    createRecord,
    updateRecord,
    verifyRecord,
    getRecord,
    searchRecords,
    getPatientRecordsHistory,
    
    // Correction management
    requestCorrection,
    processCorrectionRequest,
    getRecordsWithPendingCorrections,
    
    // Utility functions
    refreshRecords: () => {
      // Trigger re-fetch by updating a state that's watched by useEffect
      setLoading(true);
    }
  };
};

export default useRecords;