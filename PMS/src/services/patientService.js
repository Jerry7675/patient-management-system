
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import db from '../firebase/firestore';

//  Fetch verified records for the current authenticated user
export const fetchVerifiedRecordsByCurrentUser = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  const patientUid = user.uid;

 

  const recordsRef = collection(db, 'patients_records', patientUid, 'records');
  const q = query(recordsRef, where('verified', '==', true));
  const snapshot = await getDocs(q);

  const records = [];
  snapshot.forEach((docSnap) => {
    records.push({ id: docSnap.id, ...docSnap.data() });
  });

 
  return records;
};

//  Request correction on a specific record for the current authenticated user
export const requestRecordCorrection = async (recordId) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  const patientUid = user.uid;

  if (!recordId) throw new Error('recordId is required');
  console.log('[patientService] Requesting correction for:', recordId);

  const recordRef = doc(db, 'patients_records', patientUid, 'records', recordId);

  await updateDoc(recordRef, {
    verified: false,
    requestedCorrection: true,
  });

  console.log('[patientService] Correction request updated.');
  return true;
};
