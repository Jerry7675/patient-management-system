// File: src/contexts/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import firebaseAuth from '../services/firebase/auth';

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

  const signup = async (userRegistrationData) => {
    try {
      setError(null);
      setLoading(true);
      const result = await firebaseAuth.signUp(
        userRegistrationData.email,
        userRegistrationData.password,
        userRegistrationData
      );
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signin = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const result = await firebaseAuth.signIn(email, password);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    try {
      setError(null);
      await firebaseAuth.signOut();
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      await firebaseAuth.resetPassword(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const clearError = () => setError(null);

  const hasRole = (role) => userData?.role === role;
  const isVerified = () => userData?.status === 'verified';

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      try {
        setLoading(true);
        if (user) {
          setCurrentUser(user);
          const data = await firebaseAuth.getUserData(user.uid);
          setUserData(data);
        } else {
          setCurrentUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
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
  <AuthContext.Provider
    value={{
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
    }}
  >
    {children}
  </AuthContext.Provider>
);

};
export default AuthContext; // ✅ Default export
export { AuthContext };  