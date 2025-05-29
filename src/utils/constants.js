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
  SUSPENDED: 'suspended',
  REJECTED: 'rejected'
};

// Record Status
export const RECORD_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

// Case Status (Patient Condition)
export const CASE_STATUS = {
  IMPROVING: 'improving',
  STABLE: 'stable',
  DETERIORATING: 'deteriorating',
  CRITICAL: 'critical',
  RECOVERED: 'recovered'
};

// Correction Request Status
export const CORRECTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  NEW_RECORD: 'new_record',
  RECORD_VERIFIED: 'record_verified',
  CORRECTION_REQUEST: 'correction_request',
  CORRECTION_PROCESSED: 'correction_processed',
  ACCOUNT_VERIFICATION: 'account_verification',
  ACCOUNT_APPROVED: 'account_approved',
  ACCOUNT_REJECTED: 'account_rejected',
  SYSTEM_ALERT: 'system_alert'
};

// Notification Priority
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  OTP_VERIFICATION: '/otp-verification',
  MANAGEMENT_LOGIN: '/management-login',
  UNAUTHORIZED: '/unauthorized',
  POLICIES: '/policies',
  
  // Patient Routes
  PATIENT_DASHBOARD: '/patient/dashboard',
  PATIENT_RECORDS: '/patient/records',
  PATIENT_PROFILE: '/patient/profile',
  REQUEST_CORRECTION: '/patient/request-correction',
  
  // Doctor Routes
  DOCTOR_DASHBOARD: '/doctor/dashboard',
  VERIFY_RECORDS: '/doctor/verify-records',
  DOCTOR_NOTIFICATIONS: '/doctor/notifications',
  EDIT_RECORD: '/doctor/edit-record',
  CORRECTION_REQUESTS: '/doctor/correction-requests',
  
  // Management Routes
  MANAGEMENT_DASHBOARD: '/management/dashboard',
  ADD_RECORD: '/management/add-record',
  PATIENT_SEARCH: '/management/patient-search',
  RECORD_ENTRY: '/management/record-entry',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ACCOUNT_VERIFICATION: '/admin/account-verification',
  USER_MANAGEMENT: '/admin/user-management',
  SYSTEM_OVERVIEW: '/admin/system-overview'
};

// Form Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address'
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    MESSAGE: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  },
  PHONE: {
    PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
    MESSAGE: 'Please enter a valid phone number'
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s]+$/,
    MESSAGE: 'Name should contain only letters and spaces'
  },
  OTP: {
    LENGTH: 6,
    PATTERN: /^\d{6}$/,
    MESSAGE: 'OTP must be 6 digits'
  }
};

// Medical Record Fields
export const MEDICAL_FIELDS = {
  VITAL_SIGNS: {
    BLOOD_PRESSURE: 'bloodPressure',
    HEART_RATE: 'heartRate',
    TEMPERATURE: 'temperature',
    WEIGHT: 'weight',
    HEIGHT: 'height',
    OXYGEN_SATURATION: 'oxygenSaturation',
    RESPIRATORY_RATE: 'respiratoryRate'
  },
  PRESCRIPTION_FREQUENCY: {
    ONCE_DAILY: 'once_daily',
    TWICE_DAILY: 'twice_daily',
    THREE_TIMES_DAILY: 'three_times_daily',
    FOUR_TIMES_DAILY: 'four_times_daily',
    AS_NEEDED: 'as_needed',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
  },
  PRESCRIPTION_TIMING: {
    BEFORE_MEALS: 'before_meals',
    AFTER_MEALS: 'after_meals',
    WITH_MEALS: 'with_meals',
    MORNING: 'morning',
    EVENING: 'evening',
    BEDTIME: 'bedtime',
    EMPTY_STOMACH: 'empty_stomach'
  }
};

// File Upload Constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_FILES_PER_RECORD: 10
};

// Date and Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME_DISPLAY: 'DD/MM/YYYY HH:mm',
  TIME_DISPLAY: 'HH:mm'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_PAGE_SIZE: 100
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'pms_user_token',
  USER_DATA: 'pms_user_data',
  REMEMBER_EMAIL: 'pms_remember_email',
  THEME_PREFERENCE: 'pms_theme',
  LANGUAGE_PREFERENCE: 'pms_language'
};

// API Endpoints (if using external APIs)
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  AUTH: '/auth',
  USERS: '/users',
  RECORDS: '/records',
  NOTIFICATIONS: '/notifications',
  UPLOADS: '/uploads'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Please contact your administrator.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  FILE_TOO_LARGE: `File size must be less than ${FILE_UPLOAD.MAX_SIZE_MB}MB`,
  INVALID_FILE_TYPE: 'File type not supported',
  LOGIN_FAILED: 'Invalid email or password',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  OTP_EXPIRED: 'OTP has expired. Please request a new one.',
  OTP_INVALID: 'Invalid OTP. Please try again.',
  ACCOUNT_NOT_VERIFIED: 'Your account is pending verification by an administrator.',
  RECORD_NOT_FOUND: 'Medical record not found.',
  PERMISSION_DENIED: 'You do not have permission to access this record.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in',
  REGISTRATION_SUCCESS: 'Registration successful. Please wait for admin verification.',
  RECORD_CREATED: 'Medical record created successfully',
  RECORD_UPDATED: 'Medical record updated successfully',
  RECORD_VERIFIED: 'Medical record verified successfully',
  CORRECTION_REQUESTED: 'Correction request submitted successfully',
  CORRECTION_PROCESSED: 'Correction request processed successfully',
  NOTIFICATION_SENT: 'Notification sent successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  OTP_SENT: 'OTP sent to your email address'
};

// System Configuration
export const SYSTEM_CONFIG = {
  OTP_EXPIRY_MINUTES: 10,
  SESSION_TIMEOUT_MINUTES: 60,
  PASSWORD_RESET_EXPIRY_HOURS: 24,
  MAX_LOGIN_ATTEMPTS: 5,
  ACCOUNT_LOCKOUT_MINUTES: 30,
  NOTIFICATION_CLEANUP_DAYS: 30,
  BACKUP_FREQUENCY_HOURS: 24
};

// Theme Configuration
export const THEME = {
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#64748B',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#06B6D4'
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px'
  }
};

// Medical Specialties (for doctor registration)
export const MEDICAL_SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Hematology',
  'Nephrology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Surgery',
  'Urology',
  'Gynecology',
  'Ophthalmology',
  'ENT (Ear, Nose, Throat)',
  'Emergency Medicine',
  'Family Medicine',
  'Internal Medicine',
  'Anesthesiology',
  'Pathology',
  'Physical Medicine'
];

// Common Diseases (for quick selection)
export const COMMON_DISEASES = [
  'Hypertension',
  'Diabetes Mellitus',
  'Asthma',
  'Common Cold',
  'Influenza',
  'Pneumonia',
  'Bronchitis',
  'Gastritis',
  'Migraine',
  'Arthritis',
  'Allergies',
  'Anxiety',
  'Depression',
  'Insomnia',
  'Back Pain',
  'Skin Infection',
  'UTI (Urinary Tract Infection)',
  'Fever',
  'Headache',
  'Stomach Ache',
  'Chest Pain',
  'Shortness of Breath',
  'Fatigue',
  'Dizziness',
  'Nausea'
];

// Export all constants as default for easy importing
export default {
  USER_ROLES,
  ACCOUNT_STATUS,
  RECORD_STATUS,
  CASE_STATUS,
  CORRECTION_STATUS,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY,
  ROUTES,
  VALIDATION_RULES,
  MEDICAL_FIELDS,
  FILE_UPLOAD,
  DATE_FORMATS,
  PAGINATION,
  STORAGE_KEYS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SYSTEM_CONFIG,
  THEME,
  MEDICAL_SPECIALTIES,
  COMMON_DISEASES
};