import { apiClient, ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';
import { CardReviewResponse } from './deck.service';

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
  deckName?: string;
  deckSlug?: string;
}

export interface CardsApiResponse {
  status: string;
  data: {
    cards: CardResponse[];
    pagination?: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface CardReviewRequest {
  rating: number; // 1=Again, 2=Hard, 3=Good, 4=Easy
  reviewedAt?: string; // Optional, defaults to current time
}

export interface CardReviewApiResponse {
  status: string;
  data: {
    card: CardReviewResponse;
  };
}

export interface CardLog {
  id: string;
  cardId: string;
  userId: string;
  rating: number;
  state: number;
  due: string | null;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  lastElapsedDays: number;
  scheduledDays: number;
  review: string;
  createdAt: string;
}

export interface CardLogsApiResponse {
  status: string;
  data: {
    logs: CardLog[];
  };
}

export interface CreateCardRequest {
  front: string;
  back: string;
}

export interface UpdateCardRequest {
  front?: string;
  back?: string;
}

export interface CardApiResponse {
  status: string;
  data: {
    card: CardResponse;
  };
}

/**
 * Card service for handling card-related API calls
 */
export class CardService {
  /**
   * Get all cards for a specific deck
   * @param deckId The ID of the deck
   * @param limit Maximum number of cards to return (default: 20, max: 100)
   * @param offset Number of cards to skip (default: 0)
   */
  async getCardsByDeckId(
    deckId: string, 
    limit: number = 20, 
    offset: number = 0
  ): Promise<ApiResponse<CardsApiResponse>> {
    return apiClient.get<CardsApiResponse>(
      API_ENDPOINTS.cards.getByDeckId(deckId),
      { limit, offset }
    );
  }

  /**
   * Get all cards for the current user
   * @param limit Maximum number of cards to return (default: 20, max: 100)
   * @param offset Number of cards to skip (default: 0)
   */
  async getAllCards(
    limit: number = 20, 
    offset: number = 0
  ): Promise<ApiResponse<CardsApiResponse>> {
    return apiClient.get<CardsApiResponse>(
      API_ENDPOINTS.cards.list,
      { limit, offset }
    );
  }

  /**
   * Submit a review for a card
   */
  async reviewCard(cardId: string, reviewData: CardReviewRequest): Promise<ApiResponse<CardReviewApiResponse>> {
    return apiClient.post<CardReviewApiResponse>(API_ENDPOINTS.cards.review(cardId), reviewData);
  }

  /**
   * Get review logs for a card
   */
  async getCardLogs(cardId: string): Promise<ApiResponse<CardLogsApiResponse>> {
    return apiClient.get<CardLogsApiResponse>(API_ENDPOINTS.cards.logs(cardId));
  }

  /**
   * Create a new card in a deck
   */
  async createCard(deckId: string, cardData: CreateCardRequest): Promise<ApiResponse<CardApiResponse>> {
    return apiClient.post<CardApiResponse>(API_ENDPOINTS.cards.createForDeck(deckId), cardData);
  }

  /**
   * Get a card by ID
   */
  async getCard(cardId: string): Promise<ApiResponse<CardApiResponse>> {
    return apiClient.get<CardApiResponse>(API_ENDPOINTS.cards.update(cardId));
  }

  /**
   * Update an existing card
   */
  async updateCard(cardId: string, cardData: UpdateCardRequest): Promise<ApiResponse<CardApiResponse>> {
    return apiClient.patch<CardApiResponse>(API_ENDPOINTS.cards.update(cardId), cardData);
  }

  /**
   * Delete a card
   */
  async deleteCard(cardId: string): Promise<ApiResponse<{ status: string, data: null }>> {
    return apiClient.delete(API_ENDPOINTS.cards.delete(cardId));
  }
}

// Create and export a default instance
export const cardService = new CardService(); 