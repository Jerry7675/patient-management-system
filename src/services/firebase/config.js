import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// ========================
// 1. Environment Validation
// ========================
const validateEnvVars = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_DATABASE_URL' // Added for Realtime DB
  ];

  const missingVars = requiredVars.filter(key => !import.meta.env[key]);

  if (missingVars.length > 0) {
    const errorMsg = `Missing Firebase environment variables: ${missingVars.join(', ')}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
};

validateEnvVars();

// ========================
// 2. Firebase Configuration
// ========================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://patient-management-syatem-default-rtdb.asia-southeast1.firebasedatabase.app', // Fallback URL
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Optional
};

// ========================
// 3. Firebase Initialization
// ========================
let app;
let auth, db, storage, realtimeDb;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');

  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  realtimeDb = getDatabase(app);
} catch (error) {
  console.error('Firebase initialization failed:', error);
  throw new Error('Failed to initialize Firebase. Check your configuration.');
}

// ========================
// 4. App Configuration (Optimized)
// ========================
const DEFAULT_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB default
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  otpExpiryMinutes: 10,
  maxLoginAttempts: 5,
  sessionTimeoutMinutes: 30,
  appUrl: 'http://localhost:5173',
  appName: 'Patient Management System',
  debugMode: false
};

export const appConfig = {
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || DEFAULT_CONFIG.maxFileSize,
  allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || DEFAULT_CONFIG.allowedFileTypes,
  otpExpiryMinutes: parseInt(import.meta.env.VITE_OTP_EXPIRY_MINUTES) || DEFAULT_CONFIG.otpExpiryMinutes,
  maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || DEFAULT_CONFIG.maxLoginAttempts,
  sessionTimeoutMinutes: parseInt(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES) || DEFAULT_CONFIG.sessionTimeoutMinutes,
  appUrl: import.meta.env.VITE_APP_URL || DEFAULT_CONFIG.appUrl,
  appName: import.meta.env.VITE_APP_NAME || DEFAULT_CONFIG.appName,
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || DEFAULT_CONFIG.debugMode
};

// ========================
// 5. Exports
// ========================
export { auth, db, storage, realtimeDb };
export default app;