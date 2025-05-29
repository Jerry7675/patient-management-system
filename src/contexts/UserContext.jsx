import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { auth, db } from '../services/firebase/config';
import { doc, getDoc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const UserContext = createContext();

// User roles constants
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  MANAGEMENT: 'management',
  ADMIN: 'admin'
};

// Account verification status
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

// Reducer function
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
      return { 
        ...initialState, 
        loading: false 
      };
    
    case ActionTypes.UPDATE_PERMISSIONS:
      return { ...state, permissions: action.payload };
    
    default:
      return state;
  }
}

// Calculate user permissions based on role and verification status
function calculatePermissions(role, verificationStatus) {
  const isVerified = verificationStatus === VERIFICATION_STATUS.VERIFIED;
  
  const basePermissions = {
    canViewRecords: false,
    canEditRecords: false,
    canVerifyRecords: false,
    canAddRecords: false,
    canManageUsers: false,
    canRequestCorrections: false
  };

  if (!isVerified && role !== USER_ROLES.ADMIN) {
    return basePermissions;
  }

  switch (role) {
    case USER_ROLES.PATIENT:
      return {
        ...basePermissions,
        canViewRecords: true,
        canRequestCorrections: true
      };
    
    case USER_ROLES.DOCTOR:
      return {
        ...basePermissions,
        canViewRecords: true,
        canEditRecords: true,
        canVerifyRecords: true
      };
    
    case USER_ROLES.MANAGEMENT:
      return {
        ...basePermissions,
        canViewRecords: true,
        canAddRecords: true
      };
    
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
      return basePermissions;
  }
}

// UserProvider component
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Load user profile from Firestore
  const loadUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const profileData = { id: userDoc.id, ...userDoc.data() };
        dispatch({ type: ActionTypes.SET_USER_PROFILE, payload: profileData });
        
        // Start listening for notifications if user is verified
        if (profileData.verificationStatus === VERIFICATION_STATUS.VERIFIED) {
          subscribeToNotifications(userId, profileData.role);
        }
        
        return profileData;
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return null;
    }
  };

  // Subscribe to user notifications
  const subscribeToNotifications = (userId, userRole) => {
    let notificationsQuery;
    
    // Different notification queries based on user role
    switch (userRole) {
      case USER_ROLES.DOCTOR:
        notificationsQuery = query(
          collection(db, 'notifications'),
          where('recipientId', '==', userId),
          where('recipientRole', '==', 'doctor'),
          orderBy('createdAt', 'desc')
        );
        break;
      
      case USER_ROLES.MANAGEMENT:
        notificationsQuery = query(
          collection(db, 'notifications'),
          where('recipientId', '==', userId),
          where('recipientRole', '==', 'management'),
          orderBy('createdAt', 'desc')
        );
        break;
      
      case USER_ROLES.PATIENT:
        notificationsQuery = query(
          collection(db, 'notifications'),
          where('recipientId', '==', userId),
          where('recipientRole', '==', 'patient'),
          orderBy('createdAt', 'desc')
        );
        break;
      
      case USER_ROLES.ADMIN:
        notificationsQuery = query(
          collection(db, 'notifications'),
          where('recipientRole', '==', 'admin'),
          orderBy('createdAt', 'desc')
        );
        break;
      
      default:
        return;
    }

    return onSnapshot(notificationsQuery, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      dispatch({ type: ActionTypes.SET_NOTIFICATIONS, payload: notifications });
    });
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch({ type: ActionTypes.SET_USER, payload: user });
        await loadUserProfile(user.uid);
      } else {
        dispatch({ type: ActionTypes.CLEAR_USER });
      }
    });

    return unsubscribe;
  }, []);

  // Context value
  const value = {
    ...state,
    
    // User actions
    loadUserProfile,
    
    // Role checking utilities
    isPatient: () => state.userProfile?.role === USER_ROLES.PATIENT,
    isDoctor: () => state.userProfile?.role === USER_ROLES.DOCTOR,
    isManagement: () => state.userProfile?.role === USER_ROLES.MANAGEMENT,
    isAdmin: () => state.userProfile?.role === USER_ROLES.ADMIN,
    
    // Verification status checking
    isVerified: () => state.userProfile?.verificationStatus === VERIFICATION_STATUS.VERIFIED,
    isPending: () => state.userProfile?.verificationStatus === VERIFICATION_STATUS.PENDING,
    isRejected: () => state.userProfile?.verificationStatus === VERIFICATION_STATUS.REJECTED,
    
    // Permission checking
    hasPermission: (permission) => state.permissions[permission] || false,
    
    // Notification management
    markNotificationAsRead: async (notificationId) => {
      // This will be implemented in the notification service
      // For now, just update local state
      const updatedNotifications = state.notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      );
      dispatch({ type: ActionTypes.SET_NOTIFICATIONS, payload: updatedNotifications });
    },
    
    // Clear error
    clearError: () => dispatch({ type: ActionTypes.SET_ERROR, payload: null }),
    
    // Utility functions for role-based rendering
    canAccess: (allowedRoles) => {
      if (!state.userProfile) return false;
      const isVerified = state.userProfile.verificationStatus === VERIFICATION_STATUS.VERIFIED;
      const hasRole = allowedRoles.includes(state.userProfile.role);
      
      // Admin can access everything regardless of verification
      if (state.userProfile.role === USER_ROLES.ADMIN) return hasRole;
      
      return isVerified && hasRole;
    }
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the UserContext
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;