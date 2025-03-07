import { useState, useEffect, useCallback } from 'react';
import { cardService, CardResponse } from '@/lib/api/services';
import { useAuth } from './useAuth';
import { handleAuthError } from '@/lib/utils/auth-utils';

export interface SingleCard {
  id: string;
  front: string;
  back: string;
  status: string;
  review_at: string | null;
  deckId: string;
  deckName?: string;
}

interface UseCardReturn {
  card: SingleCard | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCard(cardId: string): UseCardReturn {
  const [card, setCard] = useState<SingleCard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isInitialized } = useAuth();

  const transformCard = (apiCard: CardResponse): SingleCard => {
    return {
      id: apiCard.id,
      front: apiCard.front,
      back: apiCard.back,
      status: apiCard.status,
      review_at: apiCard.reviewAt,
      deckId: apiCard.deckId,
      deckName: apiCard.deckName || `Deck ${apiCard.deckId.substring(0, 8)}`
    };
  };

  const fetchCard = useCallback(async () => {
    if (!isInitialized || !cardId) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await cardService.getCard(cardId);
      
      if (response.data && response.data.status === "success") {
        const transformedCard = transformCard(response.data.data.card);
        setCard(transformedCard);
      } else {
        setError(response.error || 'Failed to fetch card');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching the card';
      
      // Handle auth errors
      if (!handleAuthError(errorMessage)) {
        setError(errorMessage);
      }
      
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isInitialized, cardId]);

  useEffect(() => {
    fetchCard();
  }, [fetchCard]);

  return { card, isLoading, error, refetch: fetchCard };
} 