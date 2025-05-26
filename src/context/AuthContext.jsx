// File: src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChange, 
  getCurrentUserData,
  signInUser,
  signOutUser,
  registerUser,
  resetPassword
} from '../services/firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign up function
  const signup = async (userRegistrationData) => {
    try {
      setError(null);
      setLoading(true);
      const result = await registerUser(userRegistrationData);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signin = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInUser(email, password);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signout = async () => {
    try {
      setError(null);
      await signOutUser();
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password function
  const forgotPassword = async (email) => {
    try {
      setError(null);
      await resetPassword(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return userData?.role === role;
  };

  // Check if user is verified
  const isVerified = () => {
    return userData?.status === 'verified';
  };

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      try {
        setLoading(true);
        if (user) {
          setCurrentUser(user);
          // Get user data from Firestore
          const data = await getCurrentUserData(user.uid);
          setUserData(data);
        } else {
          setCurrentUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
        // If there's an error fetching user data, sign out
        setCurrentUser(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    error,
    signup,
    signin,
    signout,
    forgotPassword,
    clearError,
    hasRole,
    isVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};