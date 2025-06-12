import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { auth, db } from '../services/firebase/config';
import { doc, getDoc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const UserContext = createContext();

// User roles
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  MANAGEMENT: 'management',
  ADMIN: 'admin'
};

// Verification status
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

// Initial state
const initialState = {
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  notifications: [],
  unreadCount: 0,
  permissions: {
    canViewRecords: false,
    canEditRecords: false,
    canVerifyRecords: false,
    canAddRecords: false,
    canManageUsers: false,
    canRequestCorrections: false
  }
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  SET_ERROR: 'SET_ERROR',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  UPDATE_UNREAD_COUNT: 'UPDATE_UNREAD_COUNT',
  CLEAR_USER: 'CLEAR_USER',
  UPDATE_PERMISSIONS: 'UPDATE_PERMISSIONS'
};

// Reducer
function userReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload, loading: false };
    case ActionTypes.SET_USER_PROFILE:
      return {
        ...state,
        userProfile: action.payload,
        permissions: calculatePermissions(action.payload?.role, action.payload?.verificationStatus)
      };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ActionTypes.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length
      };
    case ActionTypes.UPDATE_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload };
    case ActionTypes.CLEAR_USER:
      return { ...initialState, loading: false };
    case ActionTypes.UPDATE_PERMISSIONS:
      return { ...state, permissions: action.payload };
    default:
      return state;
  }
}

// Permission logic
function calculatePermissions(role, verificationStatus) {
  const isVerified = verificationStatus === VERIFICATION_STATUS.VERIFIED;
  const base = {
    canViewRecords: false,
    canEditRecords: false,
    canVerifyRecords: false,
    canAddRecords: false,
    canManageUsers: false,
    canRequestCorrections: false
  };

  if (!isVerified && role !== USER_ROLES.ADMIN) return base;

  switch (role) {
    case USER_ROLES.PATIENT:
      return { ...base, canViewRecords: true, canRequestCorrections: true };
    case USER_ROLES.DOCTOR:
      return { ...base, canViewRecords: true, canEditRecords: true, canVerifyRecords: true };
    case USER_ROLES.MANAGEMENT:
      return { ...base, canViewRecords: true, canAddRecords: true };
    case USER_ROLES.ADMIN:
      return {
        canViewRecords: true,
        canEditRecords: true,
        canVerifyRecords: true,
        canAddRecords: true,
        canManageUsers: true,
        canRequestCorrections: false
      };
    default:
      return base;
  }
}

// Provider
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Safeguarded loadUserProfile
  const loadUserProfile = async (userId) => {
    if (!userId || typeof userId !== 'string') {
      console.warn('loadUserProfile: Invalid or missing userId', userId);
      return null;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const profileData = { id: userDoc.id, ...userDoc.data() };
        dispatch({ type: ActionTypes.SET_USER_PROFILE, payload: profileData });

        if (profileData.verificationStatus === VERIFICATION_STATUS.VERIFIED) {
          subscribeToNotifications(userId, profileData.role);
        }

        return profileData;
      } else {
        console.warn('User profile not found in Firestore for userId:', userId);
        return null;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return null;
    }
  };

  const subscribeToNotifications = (userId, role) => {
    let q;

    switch (role) {
      case USER_ROLES.DOCTOR:
      case USER_ROLES.MANAGEMENT:
      case USER_ROLES.PATIENT:
        q = query(
          collection(db, 'notifications'),
          where('recipientId', '==', userId),
          where('recipientRole', '==', role),
          orderBy('createdAt', 'desc')
        );
        break;
      case USER_ROLES.ADMIN:
        q = query(
          collection(db, 'notifications'),
          where('recipientRole', '==', 'admin'),
          orderBy('createdAt', 'desc')
        );
        break;
      default:
        return;
    }

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      dispatch({ type: ActionTypes.SET_NOTIFICATIONS, payload: notifications });
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.uid) {
        dispatch({ type: ActionTypes.SET_USER, payload: user });
        await loadUserProfile(user.uid);
      } else {
        dispatch({ type: ActionTypes.CLEAR_USER });
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    ...state,
    loadUserProfile,

    // Role utilities
    isPatient: () => state.userProfile?.role === USER_ROLES.PATIENT,
    isDoctor: () => state.userProfile?.role === USER_ROLES.DOCTOR,
    isManagement: () => state.userProfile?.role === USER_ROLES.MANAGEMENT,
    isAdmin: () => state.userProfile?.role === USER_ROLES.ADMIN,

    // Verification status
    isVerified: () => state.userProfile?.verificationStatus === VERIFICATION_STATUS.VERIFIED,
    isPending: () => state.userProfile?.verificationStatus === VERIFICATION_STATUS.PENDING,
    isRejected: () => state.userProfile?.verificationStatus === VERIFICATION_STATUS.REJECTED,

    // Permission checker
    hasPermission: (permission) => state.permissions[permission] || false,

    // Notification updater
    markNotificationAsRead: async (notificationId) => {
      const updated = state.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      dispatch({ type: ActionTypes.SET_NOTIFICATIONS, payload: updated });
    },

    clearError: () => dispatch({ type: ActionTypes.SET_ERROR, payload: null }),

    // Access guard
    canAccess: (allowedRoles) => {
      if (!state.userProfile) return false;
      if (state.userProfile.role === USER_ROLES.ADMIN) return true;
      return (
        state.userProfile.verificationStatus === VERIFICATION_STATUS.VERIFIED &&
        allowedRoles.includes(state.userProfile.role)
      );
    }
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
