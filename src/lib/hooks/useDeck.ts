import { useState, useEffect, useCallback } from 'react';
import { deckService, DeckResponse } from '@/lib/api/services/deck.service';
import { ApiError } from '@/lib/api/client';
import { useAuth } from './useAuth';
import { handleAuthError } from '@/lib/utils/auth-utils';

interface UseDeckReturn {
  deck: DeckResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDeck(slug: string): UseDeckReturn {
  const [deck, setDeck] = useState<DeckResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isInitialized } = useAuth();

  const fetchDeck = useCallback(async () => {
    if (!token || !slug) {
      setDeck(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await deckService.getDeckBySlug(slug);
      setDeck(response.data.data.deck);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch deck';
      
      // Handle auth errors
      if (!handleAuthError(errorMessage)) {
        setError(errorMessage);
      }
      
      console.error(err);
      setDeck(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, slug]);

  // Fetch deck when the component mounts and auth is initialized
  useEffect(() => {
    if (isInitialized) {
      fetchDeck();
    }
  }, [fetchDeck, isInitialized]);

  return {
    deck,
    isLoading,
    error,
    refetch: fetchDeck,
  };
} 