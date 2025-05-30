/**
 * Validation utility functions for the Patient Management System
 * Handles form validation, input sanitization, and data verification
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid boolean and errors array
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate phone number (supports various formats)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's 10 digits (standard format) or 11 digits (with country code)
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

/**
 * Validate name (alphabets, spaces, hyphens only)
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid name format
 */
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  const trimmedName = name.trim();
  
  return trimmedName.length >= 2 && nameRegex.test(trimmedName);
};

/**
 * Validate age (1-150 years)
 * @param {number|string} age - Age to validate
 * @returns {boolean} - True if valid age
 */
export const isValidAge = (age) => {
  const numAge = Number(age);
  return !isNaN(numAge) && numAge >= 1 && numAge <= 150;
};

/**
 * Validate date of birth (not future, not too old)
 * @param {string|Date} dob - Date of birth to validate
 * @returns {boolean} - True if valid date of birth
 */
export const isValidDateOfBirth = (dob) => {
  if (!dob) return false;
  
  const birthDate = new Date(dob);
  const today = new Date();
  const maxAge = new Date();
  maxAge.setFullYear(maxAge.getFullYear() - 150);
  
  return (
    !isNaN(birthDate.getTime()) &&
    birthDate <= today &&
    birthDate >= maxAge
  );
};

/**
 * Validate medical record ID format
 * @param {string} recordId - Record ID to validate
 * @returns {boolean} - True if valid record ID format
 */
export const isValidRecordId = (recordId) => {
  if (!recordId || typeof recordId !== 'string') return false;
  
  // Format: REC-YYYYMMDD-XXXX (REC-20240315-0001)
  const recordIdRegex = /^REC-\d{8}-\d{4}$/;
  return recordIdRegex.test(recordId);
};

/**
 * Validate patient ID format
 * @param {string} patientId - Patient ID to validate
 * @returns {boolean} - True if valid patient ID format
 */
export const isValidPatientId = (patientId) => {
  if (!patientId || typeof patientId !== 'string') return false;
  
  // Format: PAT-YYYYMMDD-XXXX (PAT-20240315-0001)
  const patientIdRegex = /^PAT-\d{8}-\d{4}$/;
  return patientIdRegex.test(patientId);
};

/**
 * Validate doctor license number
 * @param {string} licenseNumber - License number to validate
 * @returns {boolean} - True if valid license format
 */
export const isValidLicenseNumber = (licenseNumber) => {
  if (!licenseNumber || typeof licenseNumber !== 'string') return false;
  
  // Format: MED-XXXXX-YYYY (MED-12345-2024)
  const licenseRegex = /^MED-\d{5}-\d{4}$/;
  return licenseRegex.test(licenseNumber);
};

/**
 * Validate OTP format
 * @param {string} otp - OTP to validate
 * @returns {boolean} - True if valid OTP format
 */
export const isValidOTP = (otp) => {
  if (!otp || typeof otp !== 'string') return false;
  
  // 6-digit OTP
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

/**
 * Validate file upload (image files)
 * @param {File} file - File to validate
 * @returns {object} - Validation result with isValid boolean and error message
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Only JPEG, JPG, PNG, and GIF files are allowed' 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'File size must be less than 5MB' 
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} - Validation result
 */
export const validateRequired = (value, fieldName = 'Field') => {
  const isEmpty = value === null || 
                  value === undefined || 
                  (typeof value === 'string' && value.trim() === '') ||
                  (Array.isArray(value) && value.length === 0);
  
  return {
    isValid: !isEmpty,
    error: isEmpty ? `${fieldName} is required` : null
  };
};

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {object} - Validation result
 */
export const validateLength = (value, minLength, maxLength, fieldName = 'Field') => {
  if (!value || typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be a valid string` };
  }
  
  const length = value.trim().length;
  
  if (length < minLength) {
    return { 
      isValid: false, 
      error: `${fieldName} must be at least ${minLength} characters long` 
    };
  }
  
  if (length > maxLength) {
    return { 
      isValid: false, 
      error: `${fieldName} must not exceed ${maxLength} characters` 
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate dosage format (e.g., "2 tablets twice daily")
 * @param {string} dosage - Dosage to validate
 * @returns {boolean} - True if valid dosage format
 */
export const isValidDosage = (dosage) => {
  if (!dosage || typeof dosage !== 'string') return false;
  
  const trimmedDosage = dosage.trim();
  return trimmedDosage.length >= 5 && trimmedDosage.length <= 200;
};

/**
 * Validate disease/diagnosis format
 * @param {string} diagnosis - Diagnosis to validate
 * @returns {boolean} - True if valid diagnosis format
 */
export const isValidDiagnosis = (diagnosis) => {
  if (!diagnosis || typeof diagnosis !== 'string') return false;
  
  const trimmedDiagnosis = diagnosis.trim();
  return trimmedDiagnosis.length >= 2 && trimmedDiagnosis.length <= 500;
};

/**
 * Validate recommendations format
 * @param {string} recommendations - Recommendations to validate
 * @returns {boolean} - True if valid recommendations format
 */
export const isValidRecommendations = (recommendations) => {
  if (!recommendations || typeof recommendations !== 'string') return false;
  
  const trimmedRecommendations = recommendations.trim();
  return trimmedRecommendations.length >= 10 && trimmedRecommendations.length <= 1000;
};

/**
 * Validate case status
 * @param {string} status - Case status to validate
 * @returns {boolean} - True if valid status
 */
export const isValidCaseStatus = (status) => {
  const validStatuses = ['improving', 'stable', 'deteriorating', 'critical', 'recovered'];
  return validStatuses.includes(status?.toLowerCase());
};

/**
 * Sanitize string input (remove dangerous characters)
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Validate form data object
 * @param {object} formData - Form data to validate
 * @param {object} validationRules - Validation rules object
 * @returns {object} - Validation result with errors object
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    // Check required
    if (rules.required) {
      const requiredCheck = validateRequired(value, field);
      if (!requiredCheck.isValid) {
        errors[field] = requiredCheck.error;
        isValid = false;
        return;
      }
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return;
    
    // Check email
    if (rules.email && !isValidEmail(value)) {
      errors[field] = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Check phone
    if (rules.phone && !isValidPhone(value)) {
      errors[field] = 'Please enter a valid phone number';
      isValid = false;
    }
    
    // Check name
    if (rules.name && !isValidName(value)) {
      errors[field] = 'Please enter a valid name (letters, spaces, hyphens only)';
      isValid = false;
    }
    
    // Check length
    if (rules.minLength || rules.maxLength) {
      const lengthCheck = validateLength(
        value, 
        rules.minLength || 0, 
        rules.maxLength || Infinity, 
        field
      );
      if (!lengthCheck.isValid) {
        errors[field] = lengthCheck.error;
        isValid = false;
      }
    }
    
    // Check custom validation function
    if (rules.custom && typeof rules.custom === 'function') {
      const customCheck = rules.custom(value);
      if (!customCheck.isValid) {
        errors[field] = customCheck.error;
        isValid = false;
      }
    }
  });
  
  return { isValid, errors };
};