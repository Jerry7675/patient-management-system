// src/utils/helpers.js
import { USER_ROLES } from './constants';

/**
 * Format user display name
 * @param {Object} user - User object
 * @returns {string} Formatted display name
 */
export const formatUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.name) {
    return user.name;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'Unknown User';
};

/**
 * Get user role display name
 * @param {string} role - User role
 * @returns {string} Display name for role
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [USER_ROLES.PATIENT]: 'Patient',
    [USER_ROLES.DOCTOR]: 'Doctor',
    [USER_ROLES.MANAGEMENT]: 'Management Staff',
    [USER_ROLES.ADMIN]: 'Administrator'
  };
  
  return roleNames[role] || 'Unknown Role';
};

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
export const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  return Object.keys(obj).length === 0;
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '??';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate random color for avatars
 * @param {string} seed - Seed for consistent colors
 * @returns {string} Hex color code
 */
export const generateAvatarColor = (seed) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#87CEEB', '#F4A460', '#FFB6C1', '#98FB98'
  ];
  
  if (!seed) return colors[0];
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Sanitize HTML content
 * @param {string} html - HTML string
 * @returns {string} Sanitized HTML
 */
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Extract text from HTML
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export const stripHTML = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/**
 * Generate slug from string
 * @param {string} str - String to slugify
 * @returns {string} Slug
 */
export const slugify = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Parse query string
 * @param {string} queryString - Query string
 * @returns {Object} Parsed parameters
 */
export const parseQueryString = (queryString) => {
  const params = {};
  const pairs = (queryString || '').split('&');
  
  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  });
  
  return params;
};

/**
 * Build query string from object
 * @param {Object} params - Parameters object
 * @returns {string} Query string
 */
export const buildQueryString = (params) => {
  if (!params || typeof params !== 'object') return '';
  
  const pairs = Object.entries(params)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  
  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  if (!text || typeof text !== 'string') return false;
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Download file from URL
 * @param {string} url - File URL
 * @param {string} filename - Desired filename
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format medical record status
 * @param {string} status - Record status
 * @returns {Object} Status with display info
 */
export const formatRecordStatus = (status) => {
  const statusMap = {
    pending: {
      label: 'Pending Verification',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      icon: '⏳'
    },
    verified: {
      label: 'Verified',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: '✅'
    },
    correction_requested: {
      label: 'Correction Requested',
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      icon: '📝'
    },
    rejected: {
      label: 'Rejected',
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      icon: '❌'
    }
  };
  
  return statusMap[status] || statusMap.pending;
};

/**
 * Format case progression status
 * @param {string} progression - Case progression
 * @returns {Object} Progression with display info
 */
export const formatCaseProgression = (progression) => {
  const progressionMap = {
    improving: {
      label: 'Improving',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: '📈'
    },
    stable: {
      label: 'Stable',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      icon: '➡️'
    },
    deteriorating: {
      label: 'Deteriorating',
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      icon: '📉'
    },
    critical: {
      label: 'Critical',
      color: 'red',
      bgColor: 'bg-red-200',
      textColor: 'text-red-900',
      icon: '🚨'
    }
  };
  
  return progressionMap[progression] || progressionMap.stable;
};

/**
 * Mask sensitive information
 * @param {string} str - String to mask
 * @param {number} visibleChars - Number of visible characters at start/end
 * @returns {string} Masked string
 */
export const maskSensitiveInfo = (str, visibleChars = 2) => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= visibleChars * 2) return '*'.repeat(str.length);
  
  const start = str.substring(0, visibleChars);
  const end = str.substring(str.length - visibleChars);
  const middle = '*'.repeat(Math.max(str.length - visibleChars * 2, 3));
  
  return `${start}${middle}${end}`;
};

/**
 * Generate breadcrumb navigation
 * @param {string} pathname - Current pathname
 * @returns {Array} Breadcrumb items
 */
export const generateBreadcrumbs = (pathname) => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', path: '/' }];
  
  let currentPath = '';
  paths.forEach(path => {
    currentPath += `/${path}`;
    const label = path.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    breadcrumbs.push({ label, path: currentPath });
  });
  
  return breadcrumbs;
};

/**
 * Check if user has permission for action
 * @param {Object} user - User object
 * @param {string} action - Action to check
 * @param {Object} resource - Resource being accessed
 * @returns {boolean} Has permission
 */
export const hasPermission = (user, action, resource = null) => {
  if (!user || !user.role) return false;
  
  // This would integrate with your rolePermissions.js
  // For now, basic role-based checks
  const { role } = user;
  
  switch (action) {
    case 'view_records':
      return [USER_ROLES.PATIENT, USER_ROLES.DOCTOR, USER_ROLES.MANAGEMENT, USER_ROLES.ADMIN].includes(role);
    case 'create_records':
      return [USER_ROLES.MANAGEMENT, USER_ROLES.ADMIN].includes(role);
    case 'verify_records':
      return [USER_ROLES.DOCTOR, USER_ROLES.ADMIN].includes(role);
    case 'manage_users':
      return role === USER_ROLES.ADMIN;
    default:
      return false;
  }
};