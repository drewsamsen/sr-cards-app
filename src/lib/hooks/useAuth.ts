import { useState, useCallback, useEffect } from 'react';
import { authService, AuthResponse, LoginRequest, ApiError } from '@/lib/api';

interface UseAuthReturn {
  user: AuthResponse['user'] | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        authService.setAuthToken(storedToken);
      } catch (err) {
        // Invalid stored data, clear it
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      const { user, token } = response.data;
      
      // Save to state
      setUser(user);
      setToken(token);
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // Set token in API client
      authService.setAuthToken(token);
      
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
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Call logout API if user is logged in
      if (token) {
        await authService.logout();
      }
    } catch (err) {
      // Ignore errors on logout
      console.error('Logout error:', err);
    } finally {
      // Clear state and storage regardless of API call result
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      authService.setAuthToken(null);
      setIsLoading(false);
    }
  }, [token]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
} 