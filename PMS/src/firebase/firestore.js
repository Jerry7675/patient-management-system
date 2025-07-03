// src/firebase/firestore.js
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import app from './config';

const db = getFirestore(app);

// Save role on registration 
export const saveUserRole = async (uid, email, role, profile = {}) => {
  await setDoc(doc(db, 'users', uid), {
    email,
    role,
    status: 'pending', // status: 'pending' | 'verified' | 'rejected'
    profile,
    createdAt: new Date(),
  });
};

// Get role for logged-in user
export const getUserRole = async (uid) => {
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().role : null;
};

//  Get user status ('pending', 'verified', or 'rejected')
export const getUserStatus = async (uid) => {
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().status || 'pending' : 'pending';
};

//  Get user profile
export const getUserProfile = async (uid) => {
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().profile || null : null;
};

// ✅ Update user profile after registration or from dashboard
export const updateUserProfile = async (uid, profile) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { profile });
};

export default db;