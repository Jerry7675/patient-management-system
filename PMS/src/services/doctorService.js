import db from '../firebase/firestore';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  updateDoc 
} from 'firebase/firestore';

// Get doctor's profile data (name and phone)
const getDoctorProfile = async (doctorUid) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', doctorUid));
    if (!docSnap.exists()) return null;
    
    const profile = docSnap.data().profile;
    return {
      name: profile?.name || '',
      phone: profile?.phone || ''
    };
  } catch (err) {
    console.error("Error fetching doctor profile:", err);
    return null;
  }
};

// Get all patient UIDs that have records
const getPatientUidsWithRecords = async () => {
  try {
    const patientsRef = collection(db, 'patients_records');
    const snapshot = await getDocs(patientsRef);
    return snapshot.docs.map(doc => doc.id);
  } catch (err) {
    console.error("Error fetching patient UIDs:", err);
    return [];
  }
};
// Search verified records by patient name or email
export const fetchVerifiedRecordsByPatientSearch = async (searchTerm) => {
  const records = [];
  try {
    const patientsRef = collection(db, 'patients_records');
    const patientsSnapshot = await getDocs(patientsRef);
    
    for (const patientDoc of patientsSnapshot.docs) {
      const recordsRef = collection(db, 'patients_records', patientDoc.id, 'records');
      const q = query(recordsRef, where('verified', '==', true));
      const recordsSnapshot = await getDocs(q);
      
      recordsSnapshot.forEach(doc => {
        const data = doc.data();
        const nameMatch = data.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = data.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (nameMatch || emailMatch) {
          records.push({
            id: doc.id,
            patientUid: patientDoc.id,
            ...data
          });
        }
      });
    }
  } catch (err) {
    console.error("Error searching verified records:", err);
    throw err;
  }
  
  return records;
};

// Fetch unverified records for current doctor
export const fetchUnverifiedRecordsForDoctor = async (doctorUid) => {
  if (!doctorUid) return [];
  
  const doctor = await getDoctorProfile(doctorUid);
  if (!doctor?.name || !doctor?.phone) {
    console.error("Doctor profile missing name or phone");
    return [];
  }

  const records = [];
  try {
    const patientUids = await getPatientUidsWithRecords();
    
    for (const patientUid of patientUids) {
      const recordsRef = collection(db, 'patients_records', patientUid, 'records');
      const q = query(
        recordsRef,
        where('verified', '==', false),
        where('doctorName', '==', doctor.name),
        where('doctorPhone', '==', doctor.phone)
      );
      
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        records.push({
          id: doc.id,
          patientUid,
          ...doc.data()
        });
      });
    }
  } catch (err) {
    console.error("Error fetching unverified records:", err);
  }
  
  return records;
};

// Fetch correction requests for current doctor
export const fetchRequestedCorrectionRecords = async (doctorUid) => {
  if (!doctorUid) return [];
  
  const doctor = await getDoctorProfile(doctorUid);
  if (!doctor?.name || !doctor?.phone) return [];

  const records = [];
  try {
    const patientUids = await getPatientUidsWithRecords();
    
    for (const patientUid of patientUids) {
      const recordsRef = collection(db, 'patients_records', patientUid, 'records');
      const q = query(
        recordsRef,
        where('requestedCorrection', '==', true),
        where('doctorName', '==', doctor.name),
        where('doctorPhone', '==', doctor.phone)
      );
      
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        records.push({
          id: doc.id,
          patientUid,
          ...doc.data()
        });
      });
    }
  } catch (err) {
    console.error("Error fetching correction requests:", err);
  }
  
  return records;
};

// Verify a record
export const verifyRecord = async (recordId, patientUid) => {
  try {
    const recordRef = doc(db, 'patients_records', patientUid, 'records', recordId);
    await updateDoc(recordRef, {
      verified: true,
      requestedCorrection: false,
      verifiedAt: new Date(),
      verifiedBy: 'doctor'
    });
  } catch (err) {
    console.error("Error verifying record:", err);
    throw err;
  }
};
// Update a patient record
export const updatePatientRecord = async (patientUid, recordId, updatedFields) => {
  try {
    const recordRef = doc(db, 'patients_records', patientUid, 'records', recordId);
    await updateDoc(recordRef, {
      ...updatedFields,
      lastModified: new Date(),
      modifiedBy: 'doctor'
    });
  } catch (err) {
    console.error("Error updating record:", err);
    throw err;
  }
};