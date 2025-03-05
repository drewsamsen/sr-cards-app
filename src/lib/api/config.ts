/**
 * API configuration settings
 */

// Base URL for API requests
export const API_BASE_URL = 'http://localhost:3000/api';

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    refresh: `${API_BASE_URL}/auth/refresh`,
  },
  // Add more endpoint categories as needed
  users: {
    profile: `${API_BASE_URL}/users/profile`,
    update: `${API_BASE_URL}/users/update`,
  },
  // Example for future endpoints
  cards: {
    list: `${API_BASE_URL}/cards`,
    create: `${API_BASE_URL}/cards/create`,
    update: (id: string) => `${API_BASE_URL}/cards/${id}`,
    delete: (id: string) => `${API_BASE_URL}/cards/${id}`,
  },
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 10000;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}; 