/**
 * Role-based access control utilities for the Patient Management System
 * Defines permissions and access levels for different user roles
 */

// Define user roles
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  MANAGEMENT: 'management',
  ADMIN: 'admin'
};

// Define permission types
export const PERMISSIONS = {
  // Record permissions
  VIEW_RECORDS: 'view_records',
  CREATE_RECORDS: 'create_records',
  EDIT_RECORDS: 'edit_records',
  DELETE_RECORDS: 'delete_records',
  VERIFY_RECORDS: 'verify_records',
  
  // Patient permissions
  VIEW_PATIENTS: 'view_patients',
  MANAGE_PATIENTS: 'manage_patients',
  SEARCH_PATIENTS: 'search_patients',
  
  // Doctor permissions
  VIEW_DOCTORS: 'view_doctors',
  MANAGE_DOCTORS: 'manage_doctors',
  
  // User management permissions
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  VERIFY_ACCOUNTS: 'verify_accounts',
  
  // Notification permissions
  VIEW_NOTIFICATIONS: 'view_notifications',
  SEND_NOTIFICATIONS: 'send_notifications',
  MANAGE_NOTIFICATIONS: 'manage_notifications',
  
  // Correction request permissions
  REQUEST_CORRECTIONS: 'request_corrections',
  HANDLE_CORRECTIONS: 'handle_corrections',
  
  // System permissions
  VIEW_DASHBOARD: 'view_dashboard',
  SYSTEM_OVERVIEW: 'system_overview',
  MANAGE_SYSTEM: 'manage_system',
  
  // File permissions
  UPLOAD_FILES: 'upload_files',
  VIEW_FILES: 'view_files',
  DELETE_FILES: 'delete_files'
};

// Define role-based permissions
export const ROLE_PERMISSIONS = {
  [USER_ROLES.PATIENT]: [
    PERMISSIONS.VIEW_RECORDS,
    PERMISSIONS.REQUEST_CORRECTIONS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_FILES
  ],
  
  [USER_ROLES.DOCTOR]: [
    PERMISSIONS.VIEW_RECORDS,
    PERMISSIONS.EDIT_RECORDS,
    PERMISSIONS.VERIFY_RECORDS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.SEND_NOTIFICATIONS,
    PERMISSIONS.HANDLE_CORRECTIONS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_FILES,
    PERMISSIONS.UPLOAD_FILES
  ],
  
  [USER_ROLES.MANAGEMENT]: [
    PERMISSIONS.VIEW_RECORDS,
    PERMISSIONS.CREATE_RECORDS,
    PERMISSIONS.EDIT_RECORDS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.SEARCH_PATIENTS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.VIEW_FILES,
    PERMISSIONS.DELETE_FILES
  ],
  
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.VIEW_RECORDS,
    PERMISSIONS.CREATE_RECORDS,
    PERMISSIONS.EDIT_RECORDS,
    PERMISSIONS.DELETE_RECORDS,
    PERMISSIONS.VERIFY_RECORDS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.SEARCH_PATIENTS,
    PERMISSIONS.VIEW_DOCTORS,
    PERMISSIONS.MANAGE_DOCTORS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.VERIFY_ACCOUNTS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.SEND_NOTIFICATIONS,
    PERMISSIONS.MANAGE_NOTIFICATIONS,
    PERMISSIONS.REQUEST_CORRECTIONS,
    PERMISSIONS.HANDLE_CORRECTIONS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.SYSTEM_OVERVIEW,
    PERMISSIONS.MANAGE_SYSTEM,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.VIEW_FILES,
    PERMISSIONS.DELETE_FILES
  ]
};

/**
 * Check if a user has a specific permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean} - True if user has permission
 */
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;
  
  return rolePermissions.includes(permission);
};

/**
 * Check if a user has any of the specified permissions
 * @param {string} userRole - User's role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean} - True if user has at least one permission
 */
export const hasAnyPermission = (userRole, permissions) => {
  if (!userRole || !Array.isArray(permissions)) return false;
  
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Check if a user has all specified permissions
 * @param {string} userRole - User's role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean} - True if user has all permissions
 */
export const hasAllPermissions = (userRole, permissions) => {
  if (!userRole || !Array.isArray(permissions)) return false;
  
  return permissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Get all permissions for a specific role
 * @param {string} userRole - User's role
 * @returns {string[]} - Array of permissions
 */
export const getRolePermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Check if user can access a specific route/page
 * @param {string} userRole - User's role
 * @param {string} route - Route/page to check access for
 * @returns {boolean} - True if user can access the route
 */
export const canAccessRoute = (userRole, route) => {
  if (!userRole || !route) return false;
  
  const routePermissions = {
    // Patient routes
    '/patient/dashboard': [PERMISSIONS.VIEW_DASHBOARD],
    '/patient/records': [PERMISSIONS.VIEW_RECORDS],
    '/patient/profile': [PERMISSIONS.VIEW_RECORDS],
    '/patient/request-correction': [PERMISSIONS.REQUEST_CORRECTIONS],
    
    // Doctor routes
    '/doctor/dashboard': [PERMISSIONS.VIEW_DASHBOARD],
    '/doctor/verify-records': [PERMISSIONS.VERIFY_RECORDS],
    '/doctor/notifications': [PERMISSIONS.VIEW_NOTIFICATIONS],
    '/doctor/edit-record': [PERMISSIONS.EDIT_RECORDS],
    '/doctor/correction-requests': [PERMISSIONS.HANDLE_CORRECTIONS],
    
    // Management routes
    '/management/dashboard': [PERMISSIONS.VIEW_DASHBOARD],
    '/management/add-record': [PERMISSIONS.CREATE_RECORDS],
    '/management/patient-search': [PERMISSIONS.SEARCH_PATIENTS],
    '/management/record-entry': [PERMISSIONS.CREATE_RECORDS],
    
    // Admin routes
    '/admin/dashboard': [PERMISSIONS.SYSTEM_OVERVIEW],
    '/admin/account-verification': [PERMISSIONS.VERIFY_ACCOUNTS],
    '/admin/user-management': [PERMISSIONS.MANAGE_USERS],
    '/admin/system-overview': [PERMISSIONS.SYSTEM_OVERVIEW]
  };
  
  const requiredPermissions = routePermissions[route];
  if (!requiredPermissions) return true; // Public route
  
  return hasAnyPermission(userRole, requiredPermissions);
};

/**
 * Check if user can perform action on a record
 * @param {string} userRole - User's role
 * @param {string} action - Action to perform
 * @param {object} record - Record object
 * @param {string} userId - Current user's ID
 * @returns {boolean} - True if user can perform the action
 */
export const canPerformRecordAction = (userRole, action, record, userId) => {
  if (!userRole || !action || !record) return false;
  
  switch (action) {
    case 'view':
      // Patients can only view their own records
      if (userRole === USER_ROLES.PATIENT) {
        return record.patientId === userId && record.isVerified;
      }
      return hasPermission(userRole, PERMISSIONS.VIEW_RECORDS);
      
    case 'create':
      return hasPermission(userRole, PERMISSIONS.CREATE_RECORDS);
      
    case 'edit':
      // Doctors can edit records they need to verify or have verified
      if (userRole === USER_ROLES.DOCTOR) {
        return record.doctorId === userId || !record.isVerified;
      }
      // Management can edit unverified records they created
      if (userRole === USER_ROLES.MANAGEMENT) {
        return !record.isVerified && record.createdBy === userId;
      }
      return hasPermission(userRole, PERMISSIONS.EDIT_RECORDS);
      
    case 'delete':
      // Only admins can delete records
      return userRole === USER_ROLES.ADMIN;
      
    case 'verify':
      // Only doctors can verify records
      return userRole === USER_ROLES.DOCTOR && !record.isVerified;
      
    default:
      return false;
  }
};

/**
 * Check if user can manage another user account
 * @param {string} currentUserRole - Current user's role
 * @param {string} targetUserRole - Target user's role
 * @param {string} action - Action to perform
 * @returns {boolean} - True if user can perform the action
 */
export const canManageUser = (currentUserRole, targetUserRole, action) => {
  if (!currentUserRole || !targetUserRole || !action) return false;
  
  // Only admin can manage users
  if (currentUserRole !== USER_ROLES.ADMIN) return false;
  
  const managementActions = ['create', 'edit', 'delete', 'verify'];
  return managementActions.includes(action);
};

/**
 * Get accessible menu items for a user role
 * @param {string} userRole - User's role
 * @returns {object[]} - Array of menu items
 */
export const getAccessibleMenuItems = (userRole) => {
  const allMenuItems = {
    [USER_ROLES.PATIENT]: [
      { label: 'Dashboard', path: '/patient/dashboard', icon: 'dashboard' },
      { label: 'View Records', path: '/patient/records', icon: 'records' },
      { label: 'Profile', path: '/patient/profile', icon: 'profile' },
      { label: 'Request Correction', path: '/patient/request-correction', icon: 'correction' }
    ],
    
    [USER_ROLES.DOCTOR]: [
      { label: 'Dashboard', path: '/doctor/dashboard', icon: 'dashboard' },
      { label: 'Verify Records', path: '/doctor/verify-records', icon: 'verify' },
      { label: 'Notifications', path: '/doctor/notifications', icon: 'notifications' },
      { label: 'Edit Records', path: '/doctor/edit-record', icon: 'edit' },
      { label: 'Correction Requests', path: '/doctor/correction-requests', icon: 'requests' }
    ],
    
    [USER_ROLES.MANAGEMENT]: [
      { label: 'Dashboard', path: '/management/dashboard', icon: 'dashboard' },
      { label: 'Add Record', path: '/management/add-record', icon: 'add' },
      { label: 'Patient Search', path: '/management/patient-search', icon: 'search' },
      { label: 'Record Entry', path: '/management/record-entry', icon: 'entry' }
    ],
    
    [USER_ROLES.ADMIN]: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
      { label: 'Account Verification', path: '/admin/account-verification', icon: 'verify' },
      { label: 'User Management', path: '/admin/user-management', icon: 'users' },
      { label: 'System Overview', path: '/admin/system-overview', icon: 'system' }
    ]
  };
  
  return allMenuItems[userRole] || [];
};

/**
 * Check if user can access patient data
 * @param {string} userRole - User's role
 * @param {string} userId - Current user's ID
 * @param {string} patientId - Patient ID to access
 * @returns {boolean} - True if user can access patient data
 */
export const canAccessPatientData = (userRole, userId, patientId) => {
  if (!userRole || !userId) return false;
  
  switch (userRole) {
    case USER_ROLES.PATIENT:
      // Patients can only access their own data
      return userId === patientId;
      
    case USER_ROLES.DOCTOR:
    case USER_ROLES.MANAGEMENT:
    case USER_ROLES.ADMIN:
      // Healthcare providers can access any patient data
      return true;
      
    default:
      return false;
  }
};

/**
 * Get record visibility rules based on user role
 * @param {string} userRole - User's role
 * @param {string} userId - Current user's ID
 * @returns {object} - Visibility rules
 */
export const getRecordVisibilityRules = (userRole, userId) => {
  const rules = {
    showUnverified: false,
    showAllPatients: false,
    patientFilter: null,
    doctorFilter: null
  };
  
  switch (userRole) {
    case USER_ROLES.PATIENT:
      rules.patientFilter = userId;
      rules.showUnverified = false;
      break;
      
    case USER_ROLES.DOCTOR:
      rules.showUnverified = true;
      rules.showAllPatients = true;
      break;
      
    case USER_ROLES.MANAGEMENT:
      rules.showUnverified = true;
      rules.showAllPatients = true;
      break;
      
    case USER_ROLES.ADMIN:
      rules.showUnverified = true;
      rules.showAllPatients = true;
      break;
  }
  
  return rules;
};

/**
 * Check if user role is valid
 * @param {string} role - Role to validate
 * @returns {boolean} - True if valid role
 */
export const isValidRole = (role) => {
  return Object.values(USER_ROLES).includes(role);
};

/**
 * Get role hierarchy level (higher number = more privileges)
 * @param {string} role - User role
 * @returns {number} - Hierarchy level
 */
export const getRoleHierarchy = (role) => {
  const hierarchy = {
    [USER_ROLES.PATIENT]: 1,
    [USER_ROLES.DOCTOR]: 2,
    [USER_ROLES.MANAGEMENT]: 2,
    [USER_ROLES.ADMIN]: 3
  };
  
  return hierarchy[role] || 0;
};

/**
 * Check if user can escalate to another role
 * @param {string} currentRole - Current user role
 * @param {string} targetRole - Target role to escalate to
 * @returns {boolean} - True if escalation is allowed
 */
export const canEscalateRole = (currentRole, targetRole) => {
  const currentLevel = getRoleHierarchy(currentRole);
  const targetLevel = getRoleHierarchy(targetRole);
  
  // Only admins can change roles, and they can't escalate beyond their level
  return currentRole === USER_ROLES.ADMIN && targetLevel <= currentLevel;
};

/**
 * Get default dashboard route for user role
 * @param {string} userRole - User's role
 * @returns {string} - Default dashboard route
 */
export const getDefaultDashboard = (userRole) => {
  const dashboards = {
    [USER_ROLES.PATIENT]: '/patient/dashboard',
    [USER_ROLES.DOCTOR]: '/doctor/dashboard',
    [USER_ROLES.MANAGEMENT]: '/management/dashboard',
    [USER_ROLES.ADMIN]: '/admin/dashboard'
  };
  
  return dashboards[userRole] || '/';
};

/**
 * Check if user needs account verification
 * @param {object} user - User object
 * @returns {boolean} - True if user needs verification
 */
export const needsAccountVerification = (user) => {
  if (!user) return true;
  
  // Patients don't need admin verification, just email verification
  if (user.role === USER_ROLES.PATIENT) {
    return !user.emailVerified;
  }
  
  // Healthcare providers need admin verification
  return !user.isVerified || !user.emailVerified;
};

/**
 * Get required verification steps for user role
 * @param {string} userRole - User's role
 * @returns {string[]} - Array of required verification steps
 */
export const getRequiredVerificationSteps = (userRole) => {
  const baseSteps = ['email'];
  
  switch (userRole) {
    case USER_ROLES.PATIENT:
      return baseSteps;
      
    case USER_ROLES.DOCTOR:
      return [...baseSteps, 'license', 'admin_approval'];
      
    case USER_ROLES.MANAGEMENT:
      return [...baseSteps, 'admin_approval'];
      
    case USER_ROLES.ADMIN:
      return [...baseSteps, 'super_admin_approval'];
      
    default:
      return baseSteps;
  }
};