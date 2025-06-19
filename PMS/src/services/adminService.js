// src/services/adminService.js
import db from '../firebase/firestore';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Fetch all users with their verification status
export const getAllUsers = async () => {
  const usersCol = collection(db, 'users');
  const snapshot = await getDocs(usersCol);
  const users = [];
  snapshot.forEach((docSnap) => {
    users.push({ uid: docSnap.id, ...docSnap.data() });
  });
  return users;
};

// Mark user as verified
export const verifyUser = async (uid) => {
  const userDoc = doc(db, 'users', uid);
  await updateDoc(userDoc, {
    verified: true,
  });
};

// Reject user by deleting their record (and optionally their auth account in Firebase Auth if implemented)
export const rejectUser = async (uid) => {
  const userDoc = doc(db, 'users', uid);
  await deleteDoc(userDoc);
  // Note: To delete Firebase Auth user, you need Admin SDK on server side
};
