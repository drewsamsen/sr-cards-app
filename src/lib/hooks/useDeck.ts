import { useState, useEffect, useCallback } from 'react';
import { deckService, DeckResponse } from '@/lib/api/services/deck.service';
import { ApiError } from '@/lib/api/client';
import { useAuth } from './useAuth';

interface UseDeckReturn {
  deck: DeckResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchDeck: () => Promise<void>;
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
      const message = err instanceof ApiError 
        ? err.message 
        : 'Failed to fetch deck';
      
      setError(message);
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
    fetchDeck,
  };
} 