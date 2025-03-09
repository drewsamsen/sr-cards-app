import { useState, useEffect, useCallback } from 'react';
import { cardService, CardResponse } from '@/lib/api/services';
import { useAuth } from './useAuth';
import { handleAuthError } from '@/lib/utils/auth-utils';

export interface Card {
  id: string;
  front: string;
  back: string;
  status: string;
  review_at: string | null;
  deckId: string;
  deckName?: string;
  state?: number;
  difficulty?: number;
  stability?: number;
  due?: string | null;
}

// Define pagination interface
export interface CardsPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface UseCardsReturn {
  cards: Card[];
  isLoading: boolean;
  error: string | null;
  pagination: CardsPagination;
  fetchCards: (limit?: number, offset?: number) => Promise<void>;
  searchCards: (query: string, limit?: number, offset?: number) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refreshCards: () => Promise<void>;
}

export function useCards(): UseCardsReturn {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<CardsPagination>({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const { user, isInitialized } = useAuth();

  const transformCards = (apiCards: CardResponse[]): Card[] => {
    return apiCards.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back,
      status: card.status,
      review_at: card.reviewAt,
      deckId: card.deckId,
      deckName: card.deckName || `Deck ${card.deckId.substring(0, 8)}`,
      state: card.state,
      difficulty: card.difficulty,
      stability: card.stability,
      due: card.due
    }));
  };

  const fetchCards = useCallback(async (limit?: number, offset?: number) => {
    if (!isInitialized) return;
    if (!user) {
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
          limit: pageLimit,
          offset: pageOffset
        });
      } else {
        response = await cardService.getAllCards(pageLimit, pageOffset);
      }
      
      if (response.data) {
        const transformedCards = transformCards(response.data.data.cards);
        setCards(transformedCards);
        
        // Update pagination information if available
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        }
      } else {
        setError(response.error || 'Failed to fetch cards');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching cards';
      
      // Handle auth errors
      if (!handleAuthError(errorMessage)) {
        setError(errorMessage);
      }
      
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isInitialized, pagination.limit, pagination.offset, searchQuery]);

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

  // Helper function to refresh cards with current pagination and search settings
  const refreshCards = useCallback(async () => {
    await fetchCards(pagination.limit, pagination.offset);
  }, [fetchCards, pagination.limit, pagination.offset]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return { 
    cards, 
    isLoading, 
    error, 
    pagination, 
    fetchCards, 
    searchCards,
    setPage, 
    setPageSize,
    refreshCards
  };
} 