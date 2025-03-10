import { authService } from '@/lib/api/services';

// Global variable to track if we're already handling an auth error
// This prevents multiple redirects and logout attempts
let isHandlingAuthError = false;

/**
 * Handles authentication errors by logging the user out and redirecting to login page
 * @param error The error message or object
 * @returns True if the error was an auth error and was handled
 */
export const handleAuthError = (error: string | Error | unknown): boolean => {
  // Check if the error is related to authentication
  const errorMessage = typeof error === 'string' 
    ? error 
    : error instanceof Error 
      ? error.message 
      : String(error);
      
  const isAuthError = 
    errorMessage.includes('Invalid token') || 
    errorMessage.includes('expired token') ||
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Authentication required');
  
  // If it's not an auth error or we're already handling one, return
  if (!isAuthError || isHandlingAuthError) {
    return false;
  }
  
  // Set flag to prevent multiple handlers
  isHandlingAuthError = true;
  
  // Log the user out
  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      
      // Clear auth token from API client
      authService.setAuthToken(null);
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (err) {
      console.error('Error during forced logout:', err);
      // Ensure we redirect even if there's an error
      window.location.href = '/login';
    } finally {
      // Reset the flag after a delay
      setTimeout(() => {
        isHandlingAuthError = false;
      }, 1000);
    }
  };
  
  // Execute logout
  logout();
  
  return true;
}; 