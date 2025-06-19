// src/services/managementService.js
import db from '../firebase/firestore';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Get all patients for management to select from
export const getAllPatients = async () => {
  const usersCol = collection(db, 'users');
  const snapshot = await getDocs(usersCol);
  const patients = [];
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.role === 'patient') {
      patients.push({ uid: docSnap.id, ...data });
    }
  });
  return patients;
};

// Add patient record, with doctor verification pending (default verified: false)
export const addPatientRecord = async (patientUid, record) => {
  // record: { disease, reportImageUrl, prescription, dosage, recommendations }
  const recordsRef = doc(collection(db, 'patients_records'), patientUid); // Each patient has a doc with subcollection or records
  
  // For simplicity, let's store records as a subcollection of patient doc
  const patientRecordsCollection = collection(db, 'patients_records', patientUid, 'records');

  // Add new record document
  await setDoc(doc(patientRecordsCollection), {
    doctorName: '', // will be set by doctor during verification
    date: serverTimestamp(),
    disease: record.disease,
    reportImageUrl: record.reportImageUrl || '',
    prescription: record.prescription,
    dosage: record.dosage,
    recommendations: record.recommendations,
    verified: false,
    managementEntered: true,
  });
};
