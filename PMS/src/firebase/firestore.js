// src/firebase/firestore.js
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import app from './config';

const db = getFirestore(app);

// Save role on registration
export const saveUserRole = async (uid, email, role) => {
  await setDoc(doc(db, 'users', uid), {
    email,
    role,
    createdAt: new Date(),
  });
};

// Get role on login
export const getUserRole = async (uid) => {
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().role : null;
};

export default db;
