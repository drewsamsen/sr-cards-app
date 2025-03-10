import { useState, useEffect, useCallback } from 'react';
import { cardService, CardResponse } from '@/lib/api/services';
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
    limit: 10,
    offset: 0,
    hasMore: false
  });
  const { isInitialized } = useAuth();

  // Fetch cards for a specific deck
  const fetchDeckCards = useCallback(async (limit = 10, offset = 0) => {
    if (!deckId || !isInitialized) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await cardService.getCardsByDeckId(deckId, limit, offset);
      
      if (response.data.status === 'success') {
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
        
        setCards(transformCards(response.data.data.cards));
        
        // Update pagination if available
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cards. Please try again.';
      handleAuthError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [deckId, isInitialized]);

  // Search cards function
  const searchCards = useCallback(async (query: string, limit?: number, offset?: number) => {
    if (!query.trim()) {
      // If query is empty, clear search and fetch regular cards
      fetchDeckCards(limit, offset);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await cardService.searchCards({
        q: query,
        deckId,
        limit: limit !== undefined ? limit : pagination.limit,
        offset: offset !== undefined ? offset : pagination.offset
      });
      
      if (response.data.status === 'success') {
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
          }));
        };
        
        setCards(transformCards(response.data.data.cards));
        
        // Update pagination if available
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search cards. Please try again.';
      handleAuthError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [deckId, pagination.limit, pagination.offset, handleAuthError]);

  // Helper function to change page
  const setPage = useCallback((page: number) => {
    const newOffset = (page - 1) * pagination.limit;
    setPagination(prev => ({ ...prev, offset: newOffset }));
    fetchDeckCards(pagination.limit, newOffset);
  }, [pagination.limit, fetchDeckCards]);

  // Helper function to change page size
  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, limit: size, offset: 0 }));
    fetchDeckCards(size, 0);
  }, [fetchDeckCards]);

  // Fetch cards when the component mounts, auth is initialized, and deckId changes
  useEffect(() => {
    if (isInitialized && deckId) {
      fetchDeckCards();
    }
  }, [fetchDeckCards, isInitialized, deckId]);

  return {
    cards,
    isLoading,
    error,
    pagination,
    fetchCards: fetchDeckCards,
    searchCards,
    setPage,
    setPageSize
  };
} 