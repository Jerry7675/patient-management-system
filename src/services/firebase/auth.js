// src/services/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';

import { auth } from './config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firestore';

class FirebaseAuth {
  // Sign up user
  async signUp(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          emailVerified: user.emailVerified,
          metadata: {
            createdAt: user.metadata.creationTime,
            lastLoginAt: user.metadata.lastSignInTime
          }
        },
        error: null
      };
    } catch (error) {
      return {
        success: false,
        user: null,
        error: this._mapAuthError(error)
      };
    }
  }

  // Map Firebase Auth errors to user-friendly messages
  _mapAuthError(error) {
    const errorMap = {
      'auth/email-already-in-use': 'Email already in use',
      'auth/invalid-email': 'Invalid email address',
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Incorrect password',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/missing-password': 'Password is required',
      'auth/too-many-requests': 'Too many login attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Check your connection.',
    };
    return errorMap[error.code] || error.message;
  }

  // Sign in user
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = await this.getUserData(user.uid);
     console.log('User data:', userData);
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          emailVerified: user.emailVerified,
          ...userData
        }
      };
    } catch (error) {
      console.error('SignIn error:', error);
      return { success: false, error: this._mapAuthError(error) };
    }
  }

  // Sign out user
  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('SignOut error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: this._mapAuthError(error) };
    }
  }

  // Update user password
  async updateUserPassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: 'No user logged in' };

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      return { success: true };
    } catch (error) {
      console.error('Password update error:', error);
      return { success: false, error: this._mapAuthError(error) };
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!auth.currentUser;
  }

  // Get user data from Firestore
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() : {};
    } catch (error) {
      console.error('Error getting user data:', error);
      return {};
    }
  }

  // Auth state observer
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Update Firebase Auth profile
  async updateProfile(user, profileData) {
    try {
      await firebaseUpdateProfile(user, profileData);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: this._mapAuthError(error) };
    }
  }

  // Send email verification
  async sendEmailVerification() {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: 'No user logged in' };

      await sendEmailVerification(user);
      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: this._mapAuthError(error) };
    }
  }
}

const firebaseAuth = new FirebaseAuth();

export default firebaseAuth;
export { FirebaseAuth };
