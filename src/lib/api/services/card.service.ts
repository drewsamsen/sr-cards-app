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
  // Additional properties from the new API
  state?: number;
  due?: string | null;
  stability?: number;
  difficulty?: number;
  elapsedDays?: number;
  scheduledDays?: number;
  reps?: number;
  lapses?: number;
  lastReview?: string | null;
}

// New interface for card expound API response
export interface CardExpoundResponse {
  status: string;
  data: {
    cardId: string;
    front: string;
    back: string;
    explanation: string;
  };
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
    deckId?: string; // Only present when filtering by deck
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

export interface SearchCardsParams {
  q: string;
  deckId?: string;
  limit?: number;
  offset?: number;
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
    // Use the new API endpoint with deckId as a query parameter
    return apiClient.get<CardsApiResponse>(
      API_ENDPOINTS.cards.list,
      { deckId, limit, offset }
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
      { 
        limit, 
        offset
      }
    );
  }

  /**
   * Submit a review for a card
   */
  async reviewCard(cardId: string, reviewData: CardReviewRequest): Promise<ApiResponse<CardReviewApiResponse>> {
    return apiClient.post<CardReviewApiResponse>(API_ENDPOINTS.cards.review(cardId), reviewData as unknown as Record<string, unknown>);
  }

  /**
   * Create a new card in a deck
   */
  async createCard(deckId: string, cardData: CreateCardRequest): Promise<ApiResponse<CardApiResponse>> {
    return apiClient.post<CardApiResponse>(API_ENDPOINTS.cards.createForDeck(deckId), cardData as unknown as Record<string, unknown>);
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
    return apiClient.patch<CardApiResponse>(API_ENDPOINTS.cards.update(cardId), cardData as unknown as Record<string, unknown>);
  }

  /**
   * Delete a card
   */
  async deleteCard(cardId: string): Promise<ApiResponse<{ status: string, data: null }>> {
    return apiClient.delete(API_ENDPOINTS.cards.delete(cardId));
  }

  /**
   * Search for cards
   */
  async searchCards(params: SearchCardsParams): Promise<ApiResponse<CardsApiResponse>> {
    // Use the dedicated search endpoint
    return apiClient.get<CardsApiResponse>(API_ENDPOINTS.cards.search, params as unknown as Record<string, string | number | boolean>);
  }

  /**
   * Get expanded explanation for a card using AI
   */
  async expoundCard(cardId: string): Promise<ApiResponse<CardExpoundResponse>> {
    return apiClient.post<CardExpoundResponse>(API_ENDPOINTS.cards.expound(cardId));
  }
}

// Create and export a default instance
export const cardService = new CardService(); 