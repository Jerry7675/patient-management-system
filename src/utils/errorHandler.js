// src/utils/errorHandler.js
export class AppError extends Error {
  constructor(message, code, severity = 'error') {
    super(message);
    this.code = code;
    this.severity = severity;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = {
  log(error) {
    // Implement proper logging (Sentry, etc.)
    console.error(`[${error.severity}] ${error.code}: ${error.message}`);
  },

  handle(error) {
    this.log(error);
    
    if (error.isOperational) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      };
    }
    
    // For programming/unexpected errors
    return {
      success: false,
      error: {
        message: 'Something went wrong',
        code: 'INTERNAL_ERROR'
      }
    };
  }
};