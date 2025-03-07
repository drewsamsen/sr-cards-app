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

interface UseDeckCardsReturn {
  cards: DeckCard[];
  isLoading: boolean;
  error: string | null;
  fetchCards: () => Promise<void>;
}

export function useDeckCards(deckId: string | undefined): UseDeckCardsReturn {
  const [cards, setCards] = useState<DeckCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isInitialized } = useAuth();

  // Transform API card response to our UI format
  const transformCards = (apiCards: CardResponse[]): DeckCard[] => {
    return apiCards.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back,
      status: card.status,
      review_at: card.reviewAt,
      state: (card as any).state,
      difficulty: (card as any).difficulty,
      stability: (card as any).stability,
      due: (card as any).due,
      // We could generate a slug from the front text if needed
      // slug: card.front.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }));
  };

  const fetchCards = useCallback(async () => {
    if (!token || !deckId) {
      setCards([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await cardService.getCardsByDeckId(deckId);
      const transformedCards = transformCards(response.data.data.cards);
      setCards(transformedCards);
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
  }, [deckId, token, isInitialized]);

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
    fetchCards,
  };
} 