import { apiClient, ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

// Types for auth requests and responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// API response structure
export interface ApiAuthResponse {
  status: string;
  data: {
    user: {
      id: string;
      email: string;
      fullName: string;
    };
    token: string;
    refreshToken: string;
  };
}

// Simplified structure for our app's use
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  token: string;
  refreshToken: string;
}

/**
 * Auth service for handling authentication-related API calls
 */
export class AuthService {
  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<ApiResponse<ApiAuthResponse>> {
    return apiClient.post<ApiAuthResponse>(API_ENDPOINTS.auth.login, data as unknown as Record<string, unknown>);
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<ApiResponse<ApiAuthResponse>> {
    return apiClient.post<ApiAuthResponse>(API_ENDPOINTS.auth.register, data as unknown as Record<string, unknown>);
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<ApiResponse<{ status: string; message: string }>> {
    // Set the auth token before making the request
    this.setAuthToken(token);
    
    // Make the logout request
    const response = await apiClient.post<{ status: string; message: string }>(
      API_ENDPOINTS.auth.logout
    );
    
    // Clear the token after logout
    this.setAuthToken(null);
    
    return response;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ status: string; data: { token: string; refreshToken: string } }>> {
    return apiClient.post<{ status: string; data: { token: string; refreshToken: string } }>(
      API_ENDPOINTS.auth.refresh,
      { refreshToken }
    );
  }

  /**
   * Set auth token in API client
   */
  setAuthToken(token: string | null): void {
    apiClient.setAuthToken(token);
  }
}

// Create and export a default instance
export const authService = new AuthService(); 