/**
 * Date utility functions for the Patient Management System
 * Handles date formatting, validation, and calculations
 */

/**
 * Format date to display format (DD/MM/YYYY)
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format date to ISO string for database storage
 * @param {Date|string} date - Date to format
 * @returns {string} - ISO formatted date string
 */
export const formatDateForDB = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toISOString();
};

/**
 * Format datetime to display format (DD/MM/YYYY HH:MM)
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Get current date in YYYY-MM-DD format (for input fields)
 * @returns {string} - Current date string
 */
export const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Get current datetime in ISO format
 * @returns {string} - Current datetime in ISO format
 */
export const getCurrentDateTime = () => {
  return new Date().toISOString();
};

/**
 * Calculate age from birth date
 * @param {Date|string} birthDate - Birth date
 * @returns {number} - Age in years
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  if (isNaN(birth.getTime())) return 0;
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  const today = new Date();
  
  return d.toDateString() === today.toDateString();
};

/**
 * Check if date is within last 7 days
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is within last week
 */
export const isWithinLastWeek = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return d >= weekAgo;
};

/**
 * Check if date is within last 30 days
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is within last month
 */
export const isWithinLastMonth = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  
  return d >= monthAgo;
};

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  
  if (isNaN(d.getTime()) || diffMs < 0) return '';
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

/**
 * Validate date string
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if valid date
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is in the future
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  const now = new Date();
  
  return d > now;
};

/**
 * Get date range for filtering (start and end of day)
 * @param {Date|string} date - Date to get range for
 * @returns {object} - Object with start and end dates
 */
export const getDateRange = (date) => {
  if (!date) return { start: null, end: null };
  
  const d = new Date(date);
  const start = new Date(d.setHours(0, 0, 0, 0));
  const end = new Date(d.setHours(23, 59, 59, 999));
  
  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
};

/**
 * Format time for display (HH:MM)
 * @param {Date|string} date - Date/time to format
 * @returns {string} - Formatted time string
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Get month name from date
 * @param {Date|string} date - Date to get month from
 * @returns {string} - Month name
 */
export const getMonthName = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return months[d.getMonth()];
};

/**
 * Convert date to readable format (e.g., "March 15, 2024")
 * @param {Date|string} date - Date to format
 * @returns {string} - Readable date string
 */
export const toReadableDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return d.toLocaleDateString('en-US', options);
};