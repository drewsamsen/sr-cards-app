import { useState, useEffect, useCallback } from 'react';
import { cardService, CardResponse, deckService } from '@/lib/api/services';
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
}

interface UseCardsReturn {
  cards: Card[];
  isLoading: boolean;
  error: string | null;
  fetchCards: () => Promise<void>;
}

export function useCards(): UseCardsReturn {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isInitialized } = useAuth();

  const transformCards = (apiCards: CardResponse[]): Card[] => {
    return apiCards.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back,
      status: card.status,
      review_at: card.reviewAt,
      deckId: card.deckId,
      deckName: card.deckName || `Deck ${card.deckId.substring(0, 8)}`
    }));
  };

  const fetchCards = useCallback(async () => {
    if (!isInitialized) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await cardService.getAllCards();
      
      if (response.data) {
        const transformedCards = transformCards(response.data.data.cards);
        setCards(transformedCards);
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
  }, [user, isInitialized]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return { cards, isLoading, error, fetchCards };
} 