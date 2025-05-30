// src/utils/validators.js
import { USER_ROLES } from './constants'

// Email validation
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  
  return { isValid: true, error: null }
}

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' }
  }
  
  // Check for at least one uppercase letter, one lowercase letter, and one number
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    }
  }
  
  return { isValid: true, error: null }
}

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' }
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' }
  }
  
  return { isValid: true, error: null }
}

// Full name validation
export const validateFullName = (fullName) => {
  if (!fullName) {
    return { isValid: false, error: 'Full name is required' }
  }
  
  if (fullName.trim().length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters long' }
  }
  
  // Check for valid name characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/
  if (!nameRegex.test(fullName)) {
    return { isValid: false, error: 'Full name can only contain letters, spaces, hyphens, and apostrophes' }
  }
  
  return { isValid: true, error: null }
}

// Phone number validation
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' }
  }
  
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '')
  
  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits' }
  }
  
  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number cannot exceed 15 digits' }
  }
  
  return { isValid: true, error: null }
}

// OTP validation
export const validateOTP = (otp) => {
  if (!otp) {
    return { isValid: false, error: 'OTP is required' }
  }
  
  if (otp.length !== 6) {
    return { isValid: false, error: 'OTP must be 6 digits long' }
  }
  
  if (!/^\d{6}$/.test(otp)) {
    return { isValid: false, error: 'OTP must contain only numbers' }
  }
  
  return { isValid: true, error: null }
}

// Role validation
export const validateRole = (role) => {
  if (!role) {
    return { isValid: false, error: 'Role is required' }
  }
  
  const validRoles = Object.values(USER_ROLES)
  if (!validRoles.includes(role)) {
    return { isValid: false, error: 'Invalid role selected' }
  }
  
  return { isValid: true, error: null }
}

// Date validation
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) {
    return { isValid: false, error: `${fieldName} is required` }
  }
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `Please enter a valid ${fieldName.toLowerCase()}` }
  }
  
  return { isValid: true, error: null }
}

// Medical record validation
export const validateMedicalRecord = (record) => {
  const errors = {}
  
  // Validate patient name
  const nameValidation = validateFullName(record.patientName)
  if (!nameValidation.isValid) {
    errors.patientName = nameValidation.error
  }
  
  // Validate doctor name
  const doctorValidation = validateFullName(record.doctorName)
  if (!doctorValidation.isValid) {
    errors.doctorName = doctorValidation.error
  }
  
  // Validate date
  const dateValidation = validateDate(record.date, 'Date')
  if (!dateValidation.isValid) {
    errors.date = dateValidation.error
  }
  
  // Validate diagnosed disease
  if (!record.diagnosedDisease || record.diagnosedDisease.trim().length < 2) {
    errors.diagnosedDisease = 'Diagnosed disease is required and must be at least 2 characters long'
  }
  
  // Validate prescription
  if (!record.prescription || record.prescription.trim().length < 5) {
    errors.prescription = 'Prescription is required and must be at least 5 characters long'
  }
  
  // Validate dosage
  if (!record.dosage || record.dosage.trim().length < 3) {
    errors.dosage = 'Dosage information is required'
  }
  
  // Validate recommendations
  if (!record.recommendations || record.recommendations.trim().length < 10) {
    errors.recommendations = 'Recommendations are required and must be at least 10 characters long'
  }
  
  // Validate case status
  const validStatuses = ['improving', 'stable', 'deteriorating']
  if (!record.caseStatus || !validStatuses.includes(record.caseStatus.toLowerCase())) {
    errors.caseStatus = 'Please select a valid case status'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Correction request validation
export const validateCorrectionRequest = (request) => {
  const errors = {}
  
  if (!request.recordId) {
    errors.recordId = 'Record ID is required'
  }
  
  if (!request.reason || request.reason.trim().length < 10) {
    errors.reason = 'Reason for correction is required and must be at least 10 characters long'
  }
  
  if (!request.details || request.details.trim().length < 20) {
    errors.details = 'Correction details are required and must be at least 20 characters long'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// File validation
export const validateFile = (file, maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']) => {
  if (!file) {
    return { isValid: false, error: 'File is required' }
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` }
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const allowedTypesString = allowedTypes.map(type => type.split('/')[1]).join(', ')
    return { isValid: false, error: `File type must be one of: ${allowedTypesString}` }
  }
  
  return { isValid: true, error: null }
}

// Generic form validation
export const validateForm = (formData, validationRules) => {
  const errors = {}
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field]
    const value = formData[field]
    
    for (const rule of rules) {
      const result = rule(value)
      if (!result.isValid) {
        errors[field] = result.error
        break // Stop at first error for this field
      }
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}