// src/firebase/firestore.js
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import app from './config';

const db = getFirestore(app);

// Save role on registration — add 'verified: false' by default
export const saveUserRole = async (uid, email, role, verified = false) => {
  await setDoc(doc(db, 'users', uid), {
    email,
    role,
    verified,
    createdAt: new Date(),
  });
};

// Get role for logged-in user
export const getUserRole = async (uid) => {
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().role : null;
};

// ✅ Check if user is verified (called during login)
export const isUserVerified = async (uid) => {
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().verified === true : false;
};

export default db;
