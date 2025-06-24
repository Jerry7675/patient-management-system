// src/services/managementService.js
import db from '../firebase/firestore';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';

// Get all patients for management to select from
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

// Add patient record, with doctor verification pending (default verified: false)
export const addPatientRecord = async (patientUid, record) => {
  const patientRecordsCollection = collection(db, 'patients_records', patientUid, 'records');

  const docData = {
    doctorName: record.doctorName || '',
    doctorPhone: record.doctorPhone || '',
    patientName: record.patientName || '',
    date: serverTimestamp(),
    disease: record.disease || 'unspecified',
    verified: false,
    managementEntered: true,
  };

  // Optional fields only if defined
  if (record.reportImageUrl) docData.reportImageUrl = record.reportImageUrl;
  if (record.prescription) docData.prescription = record.prescription;
  if (record.dosage) docData.dosage = record.dosage;
  if (record.recommendations) docData.recommendations = record.recommendations;

  await addDoc(patientRecordsCollection, docData);
};