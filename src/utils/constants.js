// src/utils/constants.js

// User roles
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  MANAGEMENT: 'management',
  ADMIN: 'admin'
}

// Record statuses
export const RECORD_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  CORRECTION_REQUESTED: 'correction_requested'
}

// Correction request statuses
export const CORRECTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in_progress'
}

// Case status options
export const CASE_STATUS = {
  IMPROVING: 'improving',
  STABLE: 'stable',
  DETERIORATING: 'deteriorating'
}

// Time constants
export const TIME_CONSTANTS = {
  OTP_EXPIRY_MINUTES: 10,
  OTP_RESEND_COOLDOWN_SECONDS: 60,
  TOKEN_EXPIRY_HOURS: 24,
  SESSION_TIMEOUT_MINUTES: 30,
  PASSWORD_RESET_EXPIRY_HOURS: 2,
  FILE_UPLOAD_TIMEOUT_SECONDS: 30,
  API_REQUEST_TIMEOUT_SECONDS: 10,
  NOTIFICATION_AUTO_DISMISS_SECONDS: 5,
  DEBOUNCE_SEARCH_MS: 300,
  PAGINATION_DEFAULT_LIMIT: 10,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15
}

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  TIMESTAMP: 'YYYY-MM-DD HH:mm:ss',
  SHORT: 'MM/DD/YYYY',
  LONG: 'dddd, MMMM DD, YYYY'
}
export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_FILES_PER_RECORD: 5
}

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Navigation menu items by role
export const NAVIGATION_MENUS = {
  [USER_ROLES.PATIENT]: [
    { path: '/patient/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/patient/records', label: 'My Records', icon: 'file-text' },
    { path: '/patient/request-correction', label: 'Request Correction', icon: 'edit' },
    { path: '/patient/profile', label: 'Profile', icon: 'user' }
  ],
  [USER_ROLES.DOCTOR]: [
    { path: '/doctor/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/doctor/verify-records', label: 'Verify Records', icon: 'check-circle' },
    { path: '/doctor/notifications', label: 'Notifications', icon: 'bell' },
    { path: '/doctor/correction-requests', label: 'Correction Requests', icon: 'edit-3' }
  ],
  [USER_ROLES.MANAGEMENT]: [
    { path: '/management/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/management/patient-search', label: 'Patient Search', icon: 'search' },
    { path: '/management/add-record', label: 'Add Record', icon: 'plus' }
  ],
  [USER_ROLES.ADMIN]: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/admin/account-verification', label: 'Account Verification', icon: 'user-check' },
    { path: '/admin/user-management', label: 'User Management', icon: 'users' },
    { path: '/admin/system-overview', label: 'System Overview', icon: 'bar-chart' }
  ]
}

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp'
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/update-profile',
    VERIFY_ACCOUNT: '/users/verify-account'
  },
  RECORDS: {
    LIST: '/records',
    CREATE: '/records/create',
    UPDATE: '/records/update',
    DELETE: '/records/delete',
    VERIFY: '/records/verify'
  },
  CORRECTIONS: {
    REQUEST: '/corrections/request',
    LIST: '/corrections',
    RESPOND: '/corrections/respond'
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/mark-read',
    MARK_ALL_READ: '/notifications/mark-all-read'
  }
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_NOT_FOUND: 'User not found.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
  INVALID_OTP: 'Invalid or expired OTP.',
  FILE_TOO_LARGE: 'File size is too large. Maximum allowed size is 5MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image or PDF file.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
}

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTRATION_SUCCESS: 'Registration successful! Please wait for admin verification.',
  PASSWORD_RESET_SENT: 'Password reset email sent successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  RECORD_CREATED: 'Medical record created successfully.',
  RECORD_UPDATED: 'Medical record updated successfully.',
  RECORD_VERIFIED: 'Record verified successfully.',
  CORRECTION_REQUESTED: 'Correction request submitted successfully.',
  ACCOUNT_VERIFIED: 'Account verified successfully.',
  NOTIFICATION_SENT: 'Notification sent successfully.'
}

// Validation rules
export const VALIDATION_RULES = {
  EMAIL: {
    REQUIRED: true,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^\+?[\d\s\-\(\)]+$/
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s\-']+$/
  },
  OTP: {
    LENGTH: 6,
    PATTERN: /^\d{6}$/
  }
}

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_VISIBLE_PAGES: 5
}

// Theme colors
export const THEME_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6B7280',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6'
}

// Local storage keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'pms_user_token',
  USER_DATA: 'pms_user_data',
  REMEMBER_ME: 'pms_remember_me',
  THEME_PREFERENCE: 'pms_theme',
  LANGUAGE_PREFERENCE: 'pms_language'
}