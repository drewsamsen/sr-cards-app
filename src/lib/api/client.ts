import { API_BASE_URL, DEFAULT_HEADERS, REQUEST_TIMEOUT, API_ENDPOINTS } from './config';
import { handleAuthError } from '@/lib/utils/auth-utils';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Queue of callbacks to be executed after token refresh
let refreshSubscribers: Array<(token: string) => void> = [];

// Function to add callbacks to the queue
const subscribeToTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Function to notify all subscribers with the new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Function to handle token refresh
const refreshAuthToken = async (refreshToken: string): Promise<string | null> => {
  try {
    // Get the refresh endpoint from API_ENDPOINTS
    const refreshEndpoint = API_ENDPOINTS.auth.refresh;
    
    // Create a new instance of ApiClient without auth headers to avoid circular dependency
    const tempClient = new ApiClient();
    
    // Call the refresh endpoint
    const response = await tempClient.post<{
      status: string;
      data: {
        user: {
          id: string;
          email: string;
          fullName: string;
        };
        token: string;
        refreshToken: string;
      }
    }>(
      refreshEndpoint,
      { refreshToken }
    );
    
    // Extract the new tokens and user data
    const { token: newToken, refreshToken: newRefreshToken, user } = response.data.data;
    
    // Store the new tokens and user data in localStorage
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Return the new token
    return newToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    
    // Handle specific error codes from the API documentation
    if (error instanceof ApiError) {
      if (error.status === 400) {
        console.error('Missing refresh token');
      } else if (error.status === 401) {
        console.error('Invalid or expired refresh token');
      }
    }
    
    // Clear auth data on refresh failure
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    return null;
  }
};

/**
 * API response interface
 */
export interface ApiResponse<T = unknown> {
  data: T;
  error?: string;
  status: number;
}

/**
 * API error class
 */
export class ApiError extends Error {
  status: number;
  data?: Record<string, unknown>;
  code?: string;

  constructor(message: string, status: number, data?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    // Extract error code if available
    this.code = data?.code as string | undefined;
  }
}

/**
 * Base API client for handling HTTP requests
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(
    baseUrl: string = API_BASE_URL,
    defaultHeaders: Record<string, string> = DEFAULT_HEADERS as Record<string, string>
  ) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  /**
   * Set authorization header with token
   */
  setAuthToken(token: string | null): void {
    if (token) {
      this.defaultHeaders = {
        ...this.defaultHeaders,
        Authorization: `Bearer ${token}`,
      };
    } else {
      // Remove Authorization header if token is null
      const headers = { ...this.defaultHeaders };
      delete headers.Authorization;
      this.defaultHeaders = headers;
    }
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: unknown = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Type guard for data
      const errorData = data as Record<string, unknown>;
      const message = 
        (errorData?.message as string) || 
        (errorData?.error as string) || 
        response.statusText || 
        'Unknown error';
      
      // Check for auth errors (401 Unauthorized, 403 Forbidden)
      if (response.status === 401 || response.status === 403) {
        handleAuthError(message);
      }
      
      // Create ApiError with all available error details
      const apiError = new ApiError(
        message, 
        response.status, 
        typeof data === 'object' && data !== null ? data as Record<string, unknown> : undefined
      );
      
      throw apiError;
    }

    return {
      data: data as T,
      status: response.status,
    };
  }

  /**
   * Create request with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = REQUEST_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const { signal } = controller;

    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      throw error;
    }
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: Record<string, unknown> | unknown[],
    customHeaders?: Record<string, string>,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    let requestUrl = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...customHeaders,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data) {
      if (method !== 'GET') {
        options.body = JSON.stringify(data);
      } else if (data && typeof data === 'object') {
        // For GET requests, add query parameters
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
          params.append(key, String(value));
        });
        requestUrl += `?${params.toString()}`;
      }
    }

    try {
      const response = await this.fetchWithTimeout(requestUrl, options);
      return this.handleResponse<T>(response);
    } catch (error: unknown) {
      // Handle token refresh for 401 errors (expired token)
      if (error instanceof ApiError && error.status === 401 && retryCount === 0) {
        console.log('Received 401 Unauthorized response, attempting to refresh token');
        
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // If we're already refreshing, wait for it to complete
          if (isRefreshing) {
            console.log('Token refresh already in progress, waiting for completion');
            return new Promise<ApiResponse<T>>((resolve, reject) => {
              subscribeToTokenRefresh(token => {
                console.log('Using newly refreshed token for request retry');
                // Update Authorization header with new token
                this.setAuthToken(token);
                // Retry the original request
                this.request<T>(method, endpoint, data, customHeaders, retryCount + 1)
                  .then(resolve)
                  .catch(reject);
              });
            });
          }
          
          // Start refreshing
          isRefreshing = true;
          console.log('Starting token refresh process');
          
          try {
            // Attempt to refresh the token
            const newToken = await refreshAuthToken(refreshToken);
            
            // If refresh was successful
            if (newToken) {
              console.log('Token refresh successful, updating auth header');
              // Update Authorization header
              this.setAuthToken(newToken);
              
              // Notify subscribers that the token has been refreshed
              onTokenRefreshed(newToken);
              
              // Retry the original request
              console.log('Retrying original request with new token');
              return this.request<T>(method, endpoint, data, customHeaders, retryCount + 1);
            } else {
              // If refresh failed, handle auth error
              console.error('Token refresh failed, redirecting to login');
              handleAuthError('Session expired. Please log in again.');
              throw error;
            }
          } finally {
            isRefreshing = false;
          }
        } else {
          // No refresh token available, handle auth error
          console.error('No refresh token available, redirecting to login');
          handleAuthError('Session expired. Please log in again.');
          throw error;
        }
      }
      
      // For other errors or if retry failed
      if (error instanceof ApiError) {
        // Check if it's an auth error that wasn't caught in handleResponse
        if (error.status === 401 || error.status === 403) {
          handleAuthError(error.message);
        }
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      throw new ApiError(errorMessage, 0);
    }
  }

  /**
   * HTTP GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, params, headers);
  }

  /**
   * HTTP POST request
   */
  async post<T>(endpoint: string, data?: Record<string, unknown> | unknown[], headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, headers);
  }

  /**
   * HTTP PUT request
   */
  async put<T>(endpoint: string, data?: Record<string, unknown> | unknown[], headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, headers);
  }

  /**
   * HTTP PATCH request
   */
  async patch<T>(endpoint: string, data?: Record<string, unknown> | unknown[], headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, headers);
  }

  /**
   * HTTP DELETE request
   */
  async delete<T>(endpoint: string, data?: Record<string, unknown> | unknown[], headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, data, headers);
  }
}

// Create and export a default instance
export const apiClient = new ApiClient();

// Export a function to get a fresh instance if needed
export const createApiClient = (baseUrl?: string, headers?: Record<string, string>) => {
  return new ApiClient(baseUrl, headers);
}; 