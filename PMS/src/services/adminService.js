
import db from '../firebase/firestore';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Fetch all users with status
export const getAllUsers = async () => {
  const usersCol = collection(db, 'users');
  const snapshot = await getDocs(usersCol);
  const users = [];
  snapshot.forEach((docSnap) => {
    users.push({ uid: docSnap.id, ...docSnap.data() });
  });
  return users;
};

// Mark user as verified (update status)
export const verifyUser = async (uid) => {
  const userDoc = doc(db, 'users', uid);
  await updateDoc(userDoc, {
    status: 'verified',
  });
};

// Reject user by deleting their record
export const rejectUser = async (uid) => {
  const userDoc = doc(db, 'users', uid);
  await updateDoc(userDoc, { status: 'rejected' });
 
};
