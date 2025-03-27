/**
 * API configuration settings
 */

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Base URLs for API requests
const DEV_API_URL = ''; // Empty string for local development (uses the proxy)
const PROD_API_URL = process.env.API_URL || 'https://api.echocards.com'; // Use environment variable or fallback

// Base URL for API requests based on environment
export const API_BASE_URL = isProduction ? PROD_API_URL : DEV_API_URL;

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    refresh: `${API_BASE_URL}/api/auth/refresh`,
  },
  // Add more endpoint categories as needed
  users: {
    profile: `${API_BASE_URL}/api/users/profile`,
    update: `${API_BASE_URL}/api/users/update`,
    settings: `${API_BASE_URL}/api/user-settings`,
  },
  // Decks endpoints
  decks: {
    list: `${API_BASE_URL}/api/decks`,
    get: (id: string) => `${API_BASE_URL}/api/decks/${id}`,
    getBySlug: (slug: string) => `${API_BASE_URL}/api/decks/slug/${slug}`,
    create: `${API_BASE_URL}/api/decks`,
    update: (id: string) => `${API_BASE_URL}/api/decks/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/decks/${id}`,
    review: (slug: string) => `${API_BASE_URL}/api/decks/slug/${slug}/review`,
  },
  // Cards endpoints
  cards: {
    list: `${API_BASE_URL}/api/cards`, // Main endpoint for all cards operations
    create: `${API_BASE_URL}/api/cards/create`,
    createForDeck: (deckId: string) => `${API_BASE_URL}/api/decks/${deckId}/cards`,
    update: (id: string) => `${API_BASE_URL}/api/cards/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/cards/${id}`,
    // Deprecated: getByDeckId is now handled by the list endpoint with a deckId parameter
    getByDeckId: (deckId: string) => `${API_BASE_URL}/api/decks/${deckId}/cards`,
    review: (id: string) => `${API_BASE_URL}/api/cards/${id}/review`,
    expound: (id: string) => `${API_BASE_URL}/api/cards/${id}/expound`,
    // Deprecated: search is now handled by the list endpoint with a q parameter
    search: `${API_BASE_URL}/api/cards/search`,
  },
  // Import endpoints
  imports: {
    preview: `${API_BASE_URL}/api/imports/preview`,
    confirm: `${API_BASE_URL}/api/imports/confirm`,
    cancel: `${API_BASE_URL}/api/imports/cancel`,
    history: `${API_BASE_URL}/api/imports/history`,
  },
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 60000;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}; 