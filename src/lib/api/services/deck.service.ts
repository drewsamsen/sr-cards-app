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

export interface DeckApiResponse {
  status: string;
  data: {
    deck: DeckResponse;
  };
}

// Card review response interface
export interface CardReviewResponse {
  id: string;
  userId: string;
  deckId: string;
  front: string;
  back: string;
  state: number;
  due: string | null;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview: string | null;
  createdAt: string;
  updatedAt: string;
  deckName: string;
}

export interface ReviewMetrics {
  again: string;
  hard: string;
  good: string;
  easy: string;
}

export interface DeckReviewApiResponse {
  status: string;
  data: {
    deck: DeckResponse;
    card?: CardReviewResponse;
    reviewMetrics?: ReviewMetrics;
    allCaughtUp?: boolean;
    emptyDeck?: boolean;
    message?: string;
    totalCards?: number;
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

  /**
   * Get a single deck by slug
   */
  async getDeckBySlug(slug: string): Promise<ApiResponse<DeckApiResponse>> {
    return apiClient.get<DeckApiResponse>(API_ENDPOINTS.decks.getBySlug(slug));
  }

  /**
   * Get a card for review from a deck by slug
   */
  async getCardForReview(slug: string): Promise<ApiResponse<DeckReviewApiResponse>> {
    return apiClient.get<DeckReviewApiResponse>(API_ENDPOINTS.decks.review(slug));
  }
}

// Create and export a default instance
export const deckService = new DeckService(); 