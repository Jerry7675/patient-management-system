import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../services/firebase/config';

// Custom hook for authentication
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Authentication service functions
export const authService = {
  // Login with email and password
  async login(email, password, role = null) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified
      if (!user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before logging in.');
      }

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data();
      
      // Verify role if specified
      if (role && userData.role !== role) {
        await signOut(auth);
        throw new Error(`Invalid credentials for ${role} login`);
      }
      
      // Check if account is verified (except for patients)
      if (userData.role !== 'patient' && !userData.isVerified) {
        await signOut(auth);
        throw new Error('Account pending admin verification');
      }
      
      // Update last login
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: serverTimestamp(),
        isOnline: true
      });
      
      return {
        uid: user.uid,
        email: user.email,
        ...userData
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user
  async register(userData) {
    try {
      const { email, password, role, ...profileData } = userData;
      
      // Check if email already exists
      const existingUser = await this.checkEmailExists(email);
      if (existingUser) {
        throw new Error('Email already registered');
      }
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      if (profileData.name) {
        await firebaseUpdateProfile(user, {
          displayName: profileData.name
        });
      }
      
      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        role: role,
        isVerified: role === 'patient', // Patients are auto-verified, others need admin approval
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...profileData
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      // Create role-specific collections
      await this.createRoleSpecificData(user.uid, role);
      
      return {
        uid: user.uid,
        email: user.email,
        ...userProfile
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      const user = auth.currentUser;
      if (user) {
        // Update online status
        await updateDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          lastSeen: serverTimestamp()
        });
      }
      return await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Send password reset email
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  // Check if email exists
  async checkEmailExists(email) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Email check error:', error);
      return false;
    }
  },

  // Update user profile (renamed to avoid conflict)
  async updateUserProfile(userId, updates) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Update Firebase Auth profile if name changed
      if (updates.name && auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: updates.name
        });
      }
      
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  // Get current user data
  async getCurrentUserData() {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return null;
      
      return {
        uid: user.uid,
        email: user.email,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  },

  // Create role-specific data structures
  async createRoleSpecificData(userId, role) {
    try {
      switch (role) {
        case 'patient':
          await setDoc(doc(db, 'patients', userId), {
            userId: userId,
            medicalRecords: [],
            correctionRequests: [],
            createdAt: serverTimestamp()
          }, { merge: true });
          break;
          
        case 'doctor':
          await setDoc(doc(db, 'doctors', userId), {
            userId: userId,
            specialization: '',
            licenseNumber: '',
            verifiedRecords: [],
            pendingVerifications: [],
            createdAt: serverTimestamp()
          }, { merge: true });
          break;
          
        case 'management':
          await setDoc(doc(db, 'management', userId), {
            userId: userId,
            department: '',
            recordsEntered: [],
            createdAt: serverTimestamp()
          }, { merge: true });
          break;
          
        case 'admin':
          await setDoc(doc(db, 'admins', userId), {
            userId: userId,
            permissions: ['user_verification', 'system_overview'],
            verifiedUsers: [],
            createdAt: serverTimestamp()
          }, { merge: true });
          break;
      }
    } catch (error) {
      console.error('Role-specific data creation error:', error);
    }
  },

  // Verify user account (admin function)
  async verifyUserAccount(userId) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isVerified: true,
        verifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Account verification error:', error);
      throw error;
    }
  },

  // Get users pending verification (Firestore doesn't support !=, so filter client side)
  async getPendingVerifications() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('isVerified', '==', false));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role !== 'patient');
    } catch (error) {
      console.error('Get pending verifications error:', error);
      return [];
    }
  },

  // Check role permissions
  hasPermission(userRole, requiredRole) {
    const roleHierarchy = {
      'admin': 4,
      'management': 3,
      'doctor': 2,
      'patient': 1
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  },

  // Generate OTP for patient verification
  async generatePatientOTP(patientEmail) {
    try {
      // Replace unsafe chars for Firestore doc ID
      const safeDocId = patientEmail.replace(/[^\w.-]/g, '_');
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await setDoc(doc(db, 'otps', safeDocId), {
        otp,
        expiresAt,
        isUsed: false,
        createdAt: serverTimestamp()
      });
      
      return otp;
    } catch (error) {
      console.error('OTP generation error:', error);
      throw error;
    }
  },

  // Verify patient OTP
  async verifyPatientOTP(patientEmail, enteredOTP) {
    try {
      const safeDocId = patientEmail.replace(/[^\w.-]/g, '_');
      const otpDoc = await getDoc(doc(db, 'otps', safeDocId));
      
      if (!otpDoc.exists()) {
        throw new Error('OTP not found');
      }
      
      const otpData = otpDoc.data();
      
      if (otpData.isUsed) {
        throw new Error('OTP already used');
      }
      
      if (new Date() > otpData.expiresAt.toDate()) {
        throw new Error('OTP expired');
      }
      
      if (otpData.otp !== enteredOTP) {
        throw new Error('Invalid OTP');
      }
      
      // Mark OTP as used
      await updateDoc(doc(db, 'otps', safeDocId), {
        isUsed: true,
        usedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }
};

// Auth state listener hook
export const useAuthListener = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get user data from Firestore
          const userData = await authService.getCurrentUserData();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return { user, loading, error };
};
