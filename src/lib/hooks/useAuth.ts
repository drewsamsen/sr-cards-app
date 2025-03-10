import { useState, useCallback, useEffect, useRef } from 'react';
import { authService, AuthResponse, LoginRequest, ApiError } from '@/lib/api';

// Default token expiration time in milliseconds (1 hour)
const DEFAULT_TOKEN_EXPIRY = 60 * 60 * 1000;
// Refresh token 5 minutes before expiration
const REFRESH_BUFFER = 5 * 60 * 1000;

interface UseAuthReturn {
  user: AuthResponse['user'] | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Clear auth data from localStorage and state
  const clearAuthData = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    authService.setAuthToken(null);
    
    // Clear any scheduled refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Define refreshAuthToken and scheduleTokenRefresh functions first
  const refreshAuthToken = useCallback(async () => {
    if (!refreshToken) return false;
    
    try {
      const response = await authService.refreshToken(refreshToken);
      const { token: newToken, refreshToken: newRefreshToken } = response.data.data;
      
      // Update state and localStorage
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      authService.setAuthToken(newToken);
      
      // Schedule next refresh
      const expiryTime = Date.now() + DEFAULT_TOKEN_EXPIRY;
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        refreshAuthToken();
      }, DEFAULT_TOKEN_EXPIRY - REFRESH_BUFFER);
      
      return true;
    } catch (err) {
      console.error('Failed to refresh token:', err);
      // If refresh fails, log the user out
      clearAuthData();
      return false;
    }
  }, [refreshToken, clearAuthData]);

  // Schedule token refresh
  const scheduleTokenRefresh = useCallback((expiresIn: number) => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Calculate when to refresh (5 minutes before expiration or half the time if less than 10 minutes)
    const refreshDelay = expiresIn <= 10 * 60 * 1000 
      ? Math.floor(expiresIn / 2) 
      : expiresIn - REFRESH_BUFFER;
    
    if (refreshDelay <= 0) {
      // Token is already expired or about to expire, refresh immediately
      refreshAuthToken();
      return;
    }
    
    // Schedule refresh
    refreshTimeoutRef.current = setTimeout(() => {
      refreshAuthToken();
    }, refreshDelay);
    
    // Store expected expiry time in localStorage for recovery
    const expiryTime = Date.now() + expiresIn;
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    
  }, [refreshAuthToken]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedTokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (storedToken && storedUser && storedRefreshToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        authService.setAuthToken(storedToken);
        
        // Check if token is expired or about to expire
        if (storedTokenExpiry) {
          const expiryTime = parseInt(storedTokenExpiry, 10);
          const timeUntilExpiry = expiryTime - Date.now();
          
          if (timeUntilExpiry <= REFRESH_BUFFER) {
            // Token is expired or about to expire, refresh it
            refreshAuthToken();
          } else {
            // Token is still valid, schedule refresh
            scheduleTokenRefresh(timeUntilExpiry);
          }
        } else {
          // No expiry info, assume default expiration
          scheduleTokenRefresh(DEFAULT_TOKEN_EXPIRY);
        }
      } catch {
        // Invalid stored data, clear it
        clearAuthData();
      }
    }
    
    // Mark initialization as complete
    setIsInitialized(true);
    
    // Update last activity timestamp
    lastActivityRef.current = Date.now();
  }, [clearAuthData, refreshAuthToken, scheduleTokenRefresh]);

  // Handle visibility change (user returns from locking phone)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentTime = Date.now();
        const inactiveTime = currentTime - lastActivityRef.current;
        
        // If user was away for more than 1 minute and we have a refresh token
        if (inactiveTime > 60 * 1000 && refreshToken) {
          // Refresh the token when they return
          refreshAuthToken();
        }
        
        // Update last activity time
        lastActivityRef.current = currentTime;
      }
    };
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for focus events (additional fallback)
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [refreshToken, refreshAuthToken]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      // Extract data from the nested response structure
      const { user, token, refreshToken } = response.data.data;
      
      // Save to state
      setUser(user);
      setToken(token);
      setRefreshToken(refreshToken);
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Set token in API client
      authService.setAuthToken(token);
      
      // Schedule token refresh
      scheduleTokenRefresh(DEFAULT_TOKEN_EXPIRY);
      
      // Update last activity timestamp
      lastActivityRef.current = Date.now();
      
      return true;
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : 'An unexpected error occurred';
      
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [scheduleTokenRefresh]);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Call logout API if user is logged in
      if (token) {
        await authService.logout(token);
      }
    } catch (err) {
      // Ignore errors on logout
      console.error('Logout error:', err);
    } finally {
      // Clear auth data
      clearAuthData();
      setIsLoading(false);
    }
  }, [token, clearAuthData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    token,
    refreshToken,
    isLoading,
    isInitialized,
    error,
    login,
    logout,
    clearError,
  };
} 