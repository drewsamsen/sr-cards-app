import { apiClient, ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

// Types for card responses
export interface CardResponse {
  id: string;
  userId: string;
  deckId: string;
  front: string;
  back: string;
  status: string;
  reviewAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CardsApiResponse {
  status: string;
  data: {
    cards: CardResponse[];
  };
}

/**
 * Card service for handling card-related API calls
 */
export class CardService {
  /**
   * Get all cards for a specific deck
   */
  async getCardsByDeckId(deckId: string): Promise<ApiResponse<CardsApiResponse>> {
    return apiClient.get<CardsApiResponse>(API_ENDPOINTS.cards.getByDeckId(deckId));
  }

  /**
   * Get all cards for the current user
   */
  async getAllCards(): Promise<ApiResponse<CardsApiResponse>> {
    return apiClient.get<CardsApiResponse>(API_ENDPOINTS.cards.list);
  }
}

// Create and export a default instance
export const cardService = new CardService(); 