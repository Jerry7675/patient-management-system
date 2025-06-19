// src/services/doctorService.js
import db from '../firebase/firestore';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';

// Fetch all records where verified == false (pending verification)
export const getPendingRecords = async () => {
  const patientsRecordsRef = collection(db, 'patients_records');

  const pendingRecords = [];

  // Fetch all patient IDs
  const patientsSnapshot = await getDocs(patientsRecordsRef);

  for (const patientDoc of patientsSnapshot.docs) {
    // For each patient, get 'records' subcollection where verified == false
    const recordsRef = collection(db, 'patients_records', patientDoc.id, 'records');
    const q = query(recordsRef, where('verified', '==', false));
    const recordsSnapshot = await getDocs(q);

    recordsSnapshot.forEach((recDoc) => {
      pendingRecords.push({
        id: recDoc.id,
        patientUid: patientDoc.id,
        patientEmail: patientDoc.data().email || 'Unknown',
        ...recDoc.data(),
      });
    });
  }
  return pendingRecords;
};

// Verify a record by setting verified to true and adding doctorName as current user email (you can pass doctorName param)
export const verifyRecord = async (recordId, doctorName) => {
  // recordId alone is not enough because records are nested under patient docs
  // So, update needs patientUid and recordId; to keep API simple, doctor dashboard should send both.

  throw new Error(
    'verifyRecord requires patientUid and recordId. Use verifyRecordWithPatient.'
  );
};

export const verifyRecordWithPatient = async (patientUid, recordId, doctorName) => {
  const recordDocRef = doc(db, 'patients_records', patientUid, 'records', recordId);
  await updateDoc(recordDocRef, {
    verified: true,
    doctorName: doctorName || 'Doctor',
  });
};

// Edit a record by id under a patient
export const editRecord = async (patientUid, recordId, updates) => {
  const recordDocRef = doc(db, 'patients_records', patientUid, 'records', recordId);
  await updateDoc(recordDocRef, updates);
};
