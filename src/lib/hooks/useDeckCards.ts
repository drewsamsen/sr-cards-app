import { useState, useEffect, useCallback } from 'react';
import { cardService, CardResponse } from '@/lib/api/services/card.service';
import { ApiError } from '@/lib/api/client';
import { useAuth } from './useAuth';
import { handleAuthError } from '@/lib/utils/auth-utils';

// Define the transformed card type for our UI
export interface DeckCard {
  id: string;
  front: string;
  back: string;
  status: string;
  review_at: string | null;
  state?: number;
  difficulty?: number;
  stability?: number;
  due?: string | null;
  slug?: string;
}

// Define pagination interface
export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface UseDeckCardsReturn {
  cards: DeckCard[];
  isLoading: boolean;
  error: string | null;
  pagination: Pagination;
  fetchCards: (limit?: number, offset?: number) => Promise<void>;
  searchCards: (query: string, limit?: number, offset?: number) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function useDeckCards(deckId: string | undefined): UseDeckCardsReturn {
  const [cards, setCards] = useState<DeckCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const { token, isInitialized } = useAuth();

  // Transform API card response to our UI format
  const transformCards = (apiCards: CardResponse[]): DeckCard[] => {
    return apiCards.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back,
      status: card.status,
      review_at: card.reviewAt,
      state: card.state,
      difficulty: card.difficulty,
      stability: card.stability,
      due: card.due,
      // We could generate a slug from the front text if needed
      // slug: card.front.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }));
  };

  const fetchCards = useCallback(async (limit?: number, offset?: number) => {
    if (!token || !deckId) {
      setCards([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Use provided values or current pagination state
    const pageLimit = limit !== undefined ? limit : pagination.limit;
    const pageOffset = offset !== undefined ? offset : pagination.offset;

    try {
      // If there's a search query, use the search endpoint
      let response;
      if (searchQuery) {
        response = await cardService.searchCards({
          q: searchQuery,
          deckId,
          limit: pageLimit,
          offset: pageOffset
        });
      } else {
        response = await cardService.getCardsByDeckId(deckId, pageLimit, pageOffset);
      }
      
      const transformedCards = transformCards(response.data.data.cards);
      setCards(transformedCards);
      
      // Update pagination information if available
      if (response.data.data.pagination) {
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching cards';
      
      // Handle auth errors
      if (!handleAuthError(errorMessage)) {
        setError(errorMessage);
      }
      
      console.error(err);
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  }, [deckId, token, isInitialized, pagination.limit, pagination.offset, searchQuery]);

  // Search cards function
  const searchCards = useCallback(async (query: string, limit?: number, offset?: number) => {
    if (!query.trim()) {
      // If query is empty, clear search and fetch regular cards
      setSearchQuery(null);
      fetchCards(limit, offset);
      return;
    }

    setSearchQuery(query);
    fetchCards(limit, offset);
  }, [fetchCards]);

  // Helper function to change page
  const setPage = useCallback((page: number) => {
    const newOffset = (page - 1) * pagination.limit;
    setPagination(prev => ({ ...prev, offset: newOffset }));
    fetchCards(pagination.limit, newOffset);
  }, [pagination.limit, fetchCards]);

  // Helper function to change page size
  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, limit: size, offset: 0 }));
    fetchCards(size, 0);
  }, [fetchCards]);

  // Fetch cards when the component mounts, auth is initialized, and deckId changes
  useEffect(() => {
    if (isInitialized && deckId) {
      fetchCards();
    }
  }, [fetchCards, isInitialized, deckId]);

  return {
    cards,
    isLoading,
    error,
    pagination,
    fetchCards,
    searchCards,
    setPage,
    setPageSize
  };
} 