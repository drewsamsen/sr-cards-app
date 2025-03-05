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

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

/**
 * Auth service for handling authentication-related API calls
 */
export class AuthService {
  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, data);
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, data);
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.auth.logout);
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post<{ token: string }>(API_ENDPOINTS.auth.refresh);
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