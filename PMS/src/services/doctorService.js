// src/services/doctorService.js
import db from '../firebase/firestore';
import {
  collection,
  collectionGroup,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';

// 1. Fetch all unverified records assigned to this doctor
export const getPendingRecords = async (doctor) => {
  try {
    const recordsQuery = query(
      collectionGroup(db, 'records'),
      where('verified', '==', false),
      where('doctorName', '==', doctor.name),
      where('doctorPhone', '==', doctor.phone)
    );

    const snapshot = await getDocs(recordsQuery);
    const records = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const patientUid = docSnap.ref.path.split('/')[1];
      const recordId = docSnap.id;
      records.push({
        id: recordId,
        patientUid,
        ...data
      });
    });

    return records;
  } catch (error) {
    console.error('[getPendingRecords] Error:', error);
    return [];
  }
};

// 2. Get all verified records of a patient by UID
export const getVerifiedRecordsByPatient = async (patientUid) => {
  try {
    const patientRecordsRef = collection(db, 'patients_records', patientUid, 'records');
    const q = query(patientRecordsRef, where('verified', '==', true));
    const snapshot = await getDocs(q);

    const verifiedRecords = [];
    snapshot.forEach(docSnap => {
      verifiedRecords.push({ id: docSnap.id, patientUid, ...docSnap.data() });
    });
    return verifiedRecords;
  } catch (error) {
    console.error('[getVerifiedRecordsByPatient] Error:', error);
    return [];
  }
};

// 3. Verify record
export const verifyRecord = async (patientUid, recordId) => {
  const ref = doc(db, 'patients_records', patientUid, 'records', recordId);
  await updateDoc(ref, { verified: true });
};

// 4. Update record fields (e.g., medication, diagnosis, etc.)
export const updateRecord = async (patientUid, recordId, updates) => {
  const ref = doc(db, 'patients_records', patientUid, 'records', recordId);
  await updateDoc(ref, updates);
};
/**
 * Update a specific patient's record fields.
 *
 * @param {string} patientUid - UID of the patient
 * @param {string} recordId - ID of the specific record
 * @param {Object} updates - Object containing updated fields
 */
export const editRecord = async (patientUid, recordId, updates) => {
  const recordRef = doc(db, 'patients_records', patientUid, 'records', recordId);
  await updateDoc(recordRef, updates);
};
