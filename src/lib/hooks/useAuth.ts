import { useState, useCallback, useEffect, useRef } from 'react';
import { authService, AuthResponse, LoginRequest, RegisterRequest, ApiError } from '@/lib/api';
import { userService } from '@/lib/api/services/user.service';

// Default token expiration time in milliseconds (1 hour)
const DEFAULT_TOKEN_EXPIRY = 60 * 60 * 1000;
// Refresh token 5 minutes before expiration as a fallback
const REFRESH_BUFFER = 5 * 60 * 1000;

interface UseAuthReturn {
  user: AuthResponse['user'] | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
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

  // Schedule token refresh as a fallback
  // This is a safety measure in case the reactive approach fails
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
      return;
    }
    
    // Store expected expiry time in localStorage for recovery
    const expiryTime = Date.now() + expiresIn;
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    
    // Schedule refresh as a fallback
    // We don't need to actively refresh here since the API client will handle it
    // This is just to update our local state when the token is about to expire
    refreshTimeoutRef.current = setTimeout(() => {
      // Update last activity timestamp
      lastActivityRef.current = Date.now();
    }, refreshDelay);
  }, []);

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
        
        // Check if token expiry info exists
        if (storedTokenExpiry) {
          const expiryTime = parseInt(storedTokenExpiry, 10);
          const timeUntilExpiry = expiryTime - Date.now();
          
          // If token is still valid, schedule refresh as a fallback
          if (timeUntilExpiry > 0) {
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
  }, [clearAuthData, scheduleTokenRefresh]);

  // Handle visibility change (user returns from locking phone)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Update last activity time
        lastActivityRef.current = Date.now();
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
  }, []);

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
      
      // Fetch user settings immediately after login
      try {
        const settingsResponse = await userService.getUserSettings();
        if (settingsResponse.data.status === 'success' && settingsResponse.data.data.settings?.settings?.theme) {
          const userTheme = settingsResponse.data.data.settings.settings.theme;
          // Save theme to localStorage for immediate use
          localStorage.setItem('theme', userTheme);
          // Apply theme to document
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(userTheme);
        }
      } catch (settingsError) {
        console.error('Error fetching user settings after login:', settingsError);
        // Continue with login process even if settings fetch fails
      }
      
      // Schedule token refresh as a fallback
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

  const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add redirect URL for email confirmation
      const requestData = {
        ...userData,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      };
      
      const response = await authService.register(requestData);
      
      // With email confirmation enabled, we won't get tokens back immediately
      // We just need to check if the registration was successful
      if (response.data.status === "success") {
        // Update last activity timestamp
        lastActivityRef.current = Date.now();
        return true;
      } else {
        throw new Error("Registration failed");
      }
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : 'An unexpected error occurred during registration';
      
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    register,
    logout,
    clearError,
  };
} 