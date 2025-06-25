// src/services/doctorService.js
import db from '../firebase/firestore';
import {
  collection,
  getDocs,
} from 'firebase/firestore';

/**
 * Fetch all patient records from Firestore under:
 * collection 'patients_records' -> patientUid documents -> 'records' subcollection
 * 
 * @returns {Promise<Array>} Array of all records with patientUid and record data
 */
export const getAllRecords = async () => {
  try {
    console.log('[doctorService] getAllRecords started');

    // Reference to 'patients_records' collection
    const patientsRef = collection(db, 'patients_records');

    // Fetch all patient documents
    const patientsSnapshot = await getDocs(patientsRef);
    console.log(`[doctorService] Found patients: ${patientsSnapshot.size}`);

    const allRecords = [];

    // Loop through each patient document
    for (const patientDoc of patientsSnapshot.docs) {
      const patientUid = patientDoc.id;
      console.log(`[doctorService] Fetching records for patientUid: ${patientUid}`);

      // Reference to 'records' subcollection for this patient
      const recordsRef = collection(db, 'patients_records', patientUid, 'records');
      const recordsSnapshot = await getDocs(recordsRef);

      console.log(`[doctorService] Found records: ${recordsSnapshot.size} for patientUid: ${patientUid}`);

      // Loop through each record doc and push to allRecords array
      recordsSnapshot.forEach((recordDoc) => {
        allRecords.push({
          id: recordDoc.id,
          patientUid,
          ...recordDoc.data(),
        });
      });
    }

    console.log(`[doctorService] Total records fetched: ${allRecords.length}`);
    return allRecords;
  } catch (error) {
    console.error('[doctorService] Error fetching records:', error);
    throw error;
  }
};
