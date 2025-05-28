import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
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
        await updateProfile(user, {
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
      await signOut(auth);
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

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Update Firebase Auth profile if name changed
      if (updates.name && auth.currentUser) {
        await updateProfile(auth.currentUser, {
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
          // Create patient-specific collections
          await setDoc(doc(db, 'patients', userId), {
            userId: userId,
            medicalRecords: [],
            correctionRequests: [],
            createdAt: serverTimestamp()
          });
          break;
          
        case 'doctor':
          // Create doctor-specific collections
          await setDoc(doc(db, 'doctors', userId), {
            userId: userId,
            specialization: '',
            licenseNumber: '',
            verifiedRecords: [],
            pendingVerifications: [],
            createdAt: serverTimestamp()
          });
          break;
          
        case 'management':
          // Create management-specific collections
          await setDoc(doc(db, 'management', userId), {
            userId: userId,
            department: '',
            recordsEntered: [],
            createdAt: serverTimestamp()
          });
          break;
          
        case 'admin':
          // Create admin-specific collections
          await setDoc(doc(db, 'admins', userId), {
            userId: userId,
            permissions: ['user_verification', 'system_overview'],
            verifiedUsers: [],
            createdAt: serverTimestamp()
          });
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

  // Get users pending verification
  async getPendingVerifications() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('isVerified', '==', false),
        where('role', '!=', 'patient')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Store OTP in database
      await setDoc(doc(db, 'otps', patientEmail), {
        otp: otp,
        expiresAt: expiresAt,
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
      const otpDoc = await getDoc(doc(db, 'otps', patientEmail));
      
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
      await updateDoc(doc(db, 'otps', patientEmail), {
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