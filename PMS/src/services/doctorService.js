// src/services/doctorService.js
import db from '../firebase/firestore';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';

/**
 * Fetch all pending (unverified) records assigned to the given doctor.
 * @param {string} doctorEmail - The email of the logged-in doctor
 * @returns {Array} Array of pending records objects
 */
export const getPendingRecords = async (doctorEmail) => {
  const patientsRecordsRef = collection(db, 'patients_records');
  const patientsSnapshot = await getDocs(patientsRecordsRef);

  const pendingRecords = [];

  for (const patientDoc of patientsSnapshot.docs) {
    const recordsRef = collection(db, 'patients_records', patientDoc.id, 'records');
    // Query for unverified records assigned to this doctor only
    const q = query(
      recordsRef, 
      where('verified', '==', false),
      where('doctorName', '==', doctorEmail)  // Filter by doctor
    );

    const recordsSnapshot = await getDocs(q);

    for (const recDoc of recordsSnapshot.docs) {
      // Fetch patient email for display
      const patientProfileDoc = doc(db, 'users', patientDoc.id);
      const patientProfileSnap = await getDoc(patientProfileDoc);
      const patientData = patientProfileSnap.exists() ? patientProfileSnap.data() : {};

      pendingRecords.push({
        id: recDoc.id,
        patientUid: patientDoc.id,
        patientEmail: patientData.email || 'Unknown',
        ...recDoc.data(),
      });
    }
  }
  return pendingRecords;
};

/**
 * Mark a record as verified by the doctor.
 * @param {string} patientUid - UID of the patient
 * @param {string} recordId - Record document ID
 * @param {string} doctorEmail - Email of doctor verifying
 */
export const verifyRecordWithPatient = async (patientUid, recordId, doctorEmail) => {
  const recordDocRef = doc(db, 'patients_records', patientUid, 'records', recordId);
  await updateDoc(recordDocRef, {
    verified: true,
    doctorName: doctorEmail || 'Doctor',
  });
};

/**
 * Edit a patient's record.
 * @param {string} patientUid - UID of the patient
 * @param {string} recordId - Record document ID
 * @param {Object} updates - Fields to update
 */
export const editRecord = async (patientUid, recordId, updates) => {
  const recordDocRef = doc(db, 'patients_records', patientUid, 'records', recordId);
  await updateDoc(recordDocRef, updates);
};
