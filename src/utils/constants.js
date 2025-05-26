// File: src/utils/constants.js
// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  MANAGEMENT: 'management',
  ADMIN: 'admin'
};

// Account Status
export const ACCOUNT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};

// Record Status
export const RECORD_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  NEEDS_CORRECTION: 'needs_correction'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  NEW_RECORD: 'new_record',
  CORRECTION_REQUEST: 'correction_request',
  RECORD_VERIFIED: 'record_verified',
  ACCOUNT_VERIFIED: 'account_verified',
  ACCOUNT_REJECTED: 'account_rejected'
};

// Case Status
export const CASE_STATUS = {
  IMPROVING: 'improving',
  STABLE: 'stable',
  DETERIORATING: 'deteriorating'
};

// File Types
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/jpg'],
  MAX_SIZE: 5 * 1024 * 1024 // 5MB
};

// API Endpoints (if using external APIs)
export const API_ENDPOINTS = {
  EMAIL_SERVICE: '/api/email',
  OTP_SERVICE: '/api/otp'
};

// Form Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  OTP_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9]{10}$/
};

// Time Constants
export const TIME_CONSTANTS = {
  OTP_EXPIRY: 5 * 60 * 1000, // 5 minutes
}