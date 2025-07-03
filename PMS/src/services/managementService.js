
import db from '../firebase/firestore';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';

//  Get all patients for management to select from
export const getAllPatients = async () => {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('role', '==', 'patient'));
  const snapshot = await getDocs(q);
  const patients = [];
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    patients.push({ uid: docSnap.id, ...data });
  });
  return patients;
};

//  Add patient record, with doctor verification pending (default verified: false)
export const addPatientRecord = async (patientUid, record) => {
  const patientRecordsCollection = collection(db, 'patients_records', patientUid, 'records');

  //  Ensure the parent document exists
  const patientDocRef = doc(db, 'patients_records', patientUid);
  await setDoc(patientDocRef, { createdAt: serverTimestamp() }, { merge: true });

  const docData = {
    ...record, // Include all form fields dynamically
    date: serverTimestamp(),
    verified: false,
    requestedCorrection: false,
    managementEntered: true,
  };

  await addDoc(patientRecordsCollection, docData);
};
