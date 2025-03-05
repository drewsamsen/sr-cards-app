import { apiClient, ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

// Types for deck responses
export interface DeckResponse {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DecksApiResponse {
  status: string;
  data: {
    decks: DeckResponse[];
  };
}

/**
 * Deck service for handling deck-related API calls
 */
export class DeckService {
  /**
   * Get all decks for the current user
   */
  async getDecks(): Promise<ApiResponse<DecksApiResponse>> {
    return apiClient.get<DecksApiResponse>(API_ENDPOINTS.decks.list);
  }

}

// Create and export a default instance
export const deckService = new DeckService(); 