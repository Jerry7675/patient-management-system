// File: src/utils/validators.js
import { VALIDATION_RULES } from './constants';

// Email validation
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`;
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

// Name validation
export const validateName = (name) => {
  if (!name) {
    return 'Name is required';
  }
  if (name.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    return `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters long`;
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return 'Name can only contain letters and spaces';
  }
  return null;
};

// Phone validation
export const validatePhone = (phone) => {
  if (!phone) {
    return 'Phone number is required';
  }
  if (!VALIDATION_RULES.PHONE_REGEX.test(phone)) {
    return 'Please enter a valid 10-digit phone number';
  }
  return null;
};

// OTP validation
export const validateOTP = (otp) => {
  if (!otp) {
    return 'OTP is required';
  }
  if (otp.length !== VALIDATION_RULES.OTP_LENGTH) {
    return `OTP must be ${VALIDATION_RULES.OTP_LENGTH} digits long`;
  }
  if (!/^\d+$/.test(otp)) {
    return 'OTP can only contain numbers';
  }
  return null;
};

// Medical license validation (for doctors)
export const validateMedicalLicense = (license) => {
  if (!license) {
    return 'Medical license number is required';
  }
  if (license.trim().length < 5) {
    return 'Please enter a valid medical license number';
  }
  return null;
};

// Employee ID validation (for management)
export const validateEmployeeId = (empId) => {
  if (!empId) {
    return 'Employee ID is required';
  }
  if (empId.trim().length < 3) {
    return 'Please enter a valid employee ID';
  }
  return null;
};

// Date validation
export const validateDate = (date) => {
  if (!date) {
    return 'Date is required';
  }
  const selectedDate = new Date(date);
  const today = new Date();
  if (selectedDate > today) {
    return 'Date cannot be in the future';
  }
  return null;
};

// File validation
export const validateFile = (file) => {
  if (!file) {
    return null; // File is optional in most cases
  }
  
  const { IMAGES, MAX_SIZE } = require('./constants').ALLOWED_FILE_TYPES;
  
  if (!IMAGES.includes(file.type)) {
    return 'Please upload a valid image file (JPEG, PNG, JPG)';
  }
  
  if (file.size > MAX_SIZE) {
    return 'File size must be less than 5MB';
  }
  
  return null;
};

// Generic form validation
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const value = formData[field];
    const validator = validationRules[field];
    
    if (typeof validator === 'function') {
      const error = validator(value);
      if (error) {
        errors[field] = error;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};