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
    settings: `${API_BASE_URL}/user-settings`,
  },
  // Decks endpoints
  decks: {
    list: `${API_BASE_URL}/decks`,
    get: (id: string) => `${API_BASE_URL}/decks/${id}`,
    getBySlug: (slug: string) => `${API_BASE_URL}/decks/slug/${slug}`,
    create: `${API_BASE_URL}/decks`,
    update: (id: string) => `${API_BASE_URL}/decks/${id}`,
    delete: (id: string) => `${API_BASE_URL}/decks/${id}`,
    review: (slug: string) => `${API_BASE_URL}/decks/slug/${slug}/review`,
  },
  // Cards endpoints
  cards: {
    list: `${API_BASE_URL}/cards`, // Main endpoint for all cards operations
    create: `${API_BASE_URL}/cards/create`,
    createForDeck: (deckId: string) => `${API_BASE_URL}/decks/${deckId}/cards`,
    update: (id: string) => `${API_BASE_URL}/cards/${id}`,
    delete: (id: string) => `${API_BASE_URL}/cards/${id}`,
    // Deprecated: getByDeckId is now handled by the list endpoint with a deckId parameter
    getByDeckId: (deckId: string) => `${API_BASE_URL}/decks/${deckId}/cards`,
    review: (id: string) => `${API_BASE_URL}/cards/${id}/review`,
    // Deprecated: search is now handled by the list endpoint with a q parameter
    search: `${API_BASE_URL}/cards/search`,
  },
  // Import endpoints
  imports: {
    preview: `${API_BASE_URL}/imports/preview`,
    confirm: `${API_BASE_URL}/imports/confirm`,
    cancel: `${API_BASE_URL}/imports/cancel`,
    history: `${API_BASE_URL}/imports/history`,
  },
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 10000;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}; 