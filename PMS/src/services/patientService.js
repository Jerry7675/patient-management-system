// src/services/patientService.js

import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from '../firebase/config';

const db = getFirestore(app);
const auth = getAuth(app);

// Fetch all records for the current patient
export const getPatientRecords = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User not authenticated');

  const recordsRef = collection(db, 'records');
  const q = query(recordsRef, where('patientId', '==', currentUser.uid));

  const querySnapshot = await getDocs(q);
  const records = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return records;
};

// Placeholder for fetching patient profile info
export const getPatientProfile = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User not authenticated');

  const userDoc = await getDocs(collection(db, 'users'));
  const profile = userDoc.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .find((u) => u.id === currentUser.uid);

  return profile || {};
};

// Request correction on a specific record
export const requestRecordCorrection = async (recordId, message) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User not authenticated');

  const correctionRef = collection(db, 'correction_requests');
  await setDoc(doc(correctionRef, `${recordId}_${currentUser.uid}`), {
    recordId,
    patientId: currentUser.uid,
    message,
    status: 'pending',
    createdAt: new Date(),
  });
};