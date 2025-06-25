// src/services/doctorService.js
import db from '../firebase/firestore';
import {
  collection,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';

/**
 * Fetch all records assigned to the current doctor and unverified.
 */
export const getPendingRecords = async (currentDoctor) => {
  console.log('[getPendingRecords] Start');
  const result = [];

  const patientsRef = collection(db, 'patients_records');
  const patientsSnapshot = await getDocs(patientsRef);
  console.log('[getPendingRecords] Found patients:', patientsSnapshot.size);

  for (const patientDoc of patientsSnapshot.docs) {
    const patientUid = patientDoc.id;
    const recordsRef = collection(db, 'patients_records', patientUid, 'records');
    const recordsSnapshot = await getDocs(recordsRef);

    for (const recDoc of recordsSnapshot.docs) {
      const recordData = recDoc.data();
      const isAssigned = (
        recordData.doctorName?.trim().toLowerCase() === currentDoctor.name.trim().toLowerCase() &&
        recordData.doctorPhone?.trim() === currentDoctor.phone.trim()
      );
      const isUnverified = recordData.verified === false;

      if (isAssigned && isUnverified) {
        const userDoc = await getDoc(doc(db, 'users', patientUid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        result.push({
          id: recDoc.id,
          patientUid,
          patientEmail: userData.email || 'unknown',
          ...recordData
        });
      }
    }
  }

  console.log('[getPendingRecords] Returning records:', result.length);
  return result;
};
