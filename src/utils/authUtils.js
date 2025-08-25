/**
 * Utility functions for handling authentication errors
 */

/**
 * Checks if an error is a JWT expired error
 * @param {Object} error - The error object
 * @returns {boolean} - True if it's a JWT expired error
 */
export const isJwtExpiredError = (error) => {
  return (
    error?.error === 'jwt expired' || 
    error?.message?.includes('jwt expired') ||
    error?.response?.data?.error === 'jwt expired' ||
    error?.response?.data?.message?.includes('jwt expired')
  );
};

/**
 * Handles JWT expired error by showing a message and redirecting to login
 * @param {Function} onClose - Optional function to close modal/dialog
 * @param {string} redirectPath - Path to redirect to (default: '/auth/login')
 * @param {number} delay - Delay before redirect in milliseconds (default: 1500)
 */
export const handleJwtExpired = (onClose = null, redirectPath = '/auth/login', delay = 1500) => {
  // Show user-friendly message
  if (typeof window !== 'undefined' && window.toast) {
    window.toast.error('Session expired. Please login again.');
  } else {
    console.warn('Session expired. Please login again.');
  }
  
  // Close modal/dialog if provided
  if (onClose && typeof onClose === 'function') {
    onClose();
  }
  
  // Redirect to login page after delay
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      window.location.href = redirectPath;
    }
  }, delay);
};

/**
 * Wrapper for async operations that automatically handles JWT expired errors
 * @param {Function} asyncFn - The async function to wrap
 * @param {Function} onClose - Optional function to close modal/dialog
 * @param {string} redirectPath - Path to redirect to (default: '/auth/login')
 * @returns {Promise} - The wrapped function result
 */
export const withJwtErrorHandling = async (asyncFn, onClose = null, redirectPath = '/auth/login') => {
  try {
    return await asyncFn();
  } catch (error) {
    if (isJwtExpiredError(error)) {
      handleJwtExpired(onClose, redirectPath);
      throw error; // Re-throw so calling code knows the operation failed
    }
    throw error; // Re-throw other errors
  }
};
