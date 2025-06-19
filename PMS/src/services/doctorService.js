// src/services/doctorService.js
import { getDocs, collection, doc, updateDoc, getDoc } from 'firebase/firestore';
import db from '../firebase/firestore';

// Get records awaiting doctor verification
export const getPendingRecords = async () => {
  const snapshot = await getDocs(collection(db, 'records'));
  const pending = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.verifiedByDoctor) {
      pending.push({ id: docSnap.id, ...data });
    }
  });

  return pending;
};

// Verify a specific record by recordId
export const verifyRecord = async (recordId) => {
  const recordRef = doc(db, 'records', recordId);
  await updateDoc(recordRef, {
    verifiedByDoctor: true,
    verifiedAt: new Date(),
  });
};

// Update record if corrections are needed
export const updateRecord = async (recordId, updatedFields) => {
  const recordRef = doc(db, 'records', recordId);
  await updateDoc(recordRef, updatedFields);
};

// Fetch full record for editing/review
export const getRecordById = async (recordId) => {
  const recordRef = doc(db, 'records', recordId);
  const snapshot = await getDoc(recordRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};