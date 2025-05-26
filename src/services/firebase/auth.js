// File: src/services/firebase/auth.js
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { USER_ROLES, ACCOUNT_STATUS } from '../../utils/constants';

// Register new user
export const registerUser = async (userData) => {
  try {
    const { email, password, name, role, additionalInfo } = userData;
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, { displayName: name });
    
    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      name,
      email,
      role,
      status: role === USER_ROLES.ADMIN ? ACCOUNT_STATUS.VERIFIED : ACCOUNT_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      ...additionalInfo
    };
    
    await setDoc(doc(db, 'users', user.uid), userDoc);
    
    return { user, userDoc };
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
};

// Sign in user
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }
    
    const userData = userDoc.data();
    
    // Check if account is verified (except for admin)
    if (userData.role !== USER_ROLES.ADMIN && userData.status !== ACCOUNT_STATUS.VERIFIED) {
      await signOut(auth);
      throw new Error('Account not yet verified by admin');
    }
    
    return { user, userData };
  } catch (error) {
    throw new Error(`Sign in failed: ${error.message}`);
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(`Sign out failed: ${error.message}`);
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(`Password reset failed: ${error.message}`);
  }
};

// Get current user data
export const getCurrentUserData = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }
    
    return userDoc.data();
  } catch (error) {
    throw new Error(`Failed to get user data: ${error.message}`);
  }
};

// Update user profile
export const updateUserProfile = async (uid, updateData) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    throw new Error(`Profile update failed: ${error.message}`);
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};