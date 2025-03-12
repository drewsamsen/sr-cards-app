import { apiClient, ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

// Types for deck responses
export interface DeckResponse {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  dailyScaler?: number;
  totalCards?: number;
  remainingReviews?: number;
  newCards?: number;
  dueCards?: number;
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
  deckSlug?: string;
  reviewMetrics?: ReviewMetrics;
}

export interface ReviewMetrics {
  again: string;
  hard: string;
  good: string;
  easy: string;
}

export interface DailyProgress {
  newCardsSeen: number;
  newCardsLimit: number;
  reviewCardsSeen: number;
  reviewCardsLimit: number;
  totalRemaining: number;
}

export interface DeckReviewApiResponse {
  status: string;
  data: {
    deck: DeckResponse;
    cards: CardReviewResponse[];
    allCaughtUp?: boolean;
    emptyDeck?: boolean;
    dailyLimitReached?: boolean;
    dailyProgress?: DailyProgress;
    message?: string;
    totalCards?: number;
  };
}

// Add interface for create deck request
export interface CreateDeckRequest {
  name: string;
  description: string;
}

// Add interface for update deck request
export interface UpdateDeckRequest {
  name: string;
  description: string;
  slug?: string;
  dailyScaler?: number;
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

  /**
   * Create a new deck
   */
  async createDeck(data: CreateDeckRequest): Promise<ApiResponse<DeckApiResponse>> {
    return apiClient.post<DeckApiResponse>(API_ENDPOINTS.decks.create, data as unknown as Record<string, unknown>);
  }

  /**
   * Update an existing deck
   */
  async updateDeck(id: string, data: UpdateDeckRequest): Promise<ApiResponse<DeckApiResponse>> {
    return apiClient.patch<DeckApiResponse>(API_ENDPOINTS.decks.update(id), data as unknown as Record<string, unknown>);
  }

  /**
   * Delete a deck
   */
  async deleteDeck(id: string): Promise<ApiResponse<{ status: string; data: { message: string } }>> {
    return apiClient.delete(API_ENDPOINTS.decks.delete(id));
  }
}

// Create and export a default instance
export const deckService = new DeckService(); 