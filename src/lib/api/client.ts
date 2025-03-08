import { API_BASE_URL, DEFAULT_HEADERS, REQUEST_TIMEOUT } from './config';
import { handleAuthError } from '@/lib/utils/auth-utils';

/**
 * API response interface
 */
export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  status: number;
}

/**
 * API error class
 */
export class ApiError extends Error {
  status: number;
  data?: any;
  code?: string;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    // Extract error code if available
    this.code = data?.code || null;
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
    let data: any = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message = data?.message || data?.error || response.statusText || 'Unknown error';
      
      // Check for auth errors (401 Unauthorized, 403 Forbidden)
      if (response.status === 401 || response.status === 403) {
        handleAuthError(message);
      }
      
      // Create ApiError with all available error details
      const apiError = new ApiError(message, response.status, data);
      
      throw apiError;
    }

    return {
      data,
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
    data?: any,
    customHeaders?: Record<string, string>
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
  async get<T>(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, params, headers);
  }

  /**
   * HTTP POST request
   */
  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, headers);
  }

  /**
   * HTTP PUT request
   */
  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, headers);
  }

  /**
   * HTTP PATCH request
   */
  async patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, headers);
  }

  /**
   * HTTP DELETE request
   */
  async delete<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, data, headers);
  }
}

// Create and export a default instance
export const apiClient = new ApiClient();

// Export a function to get a fresh instance if needed
export const createApiClient = (baseUrl?: string, headers?: Record<string, string>) => {
  return new ApiClient(baseUrl, headers);
}; 