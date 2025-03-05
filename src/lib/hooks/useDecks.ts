import { useState, useEffect, useCallback } from 'react';
import { deckService, DeckResponse } from '@/lib/api/services/deck.service';
import { ApiError } from '@/lib/api/client';
import { useAuth } from './useAuth';

interface UseDeckReturn {
  decks: DeckResponse[];
  isLoading: boolean;
  error: string | null;
  fetchDecks: () => Promise<void>;
}

export function useDecks(): UseDeckReturn {
  const [decks, setDecks] = useState<DeckResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isInitialized } = useAuth();

  const fetchDecks = useCallback(async () => {
    if (!token) {
      setDecks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await deckService.getDecks();
      setDecks(response.data.data.decks);
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : 'Failed to fetch decks';
      
      setError(message);
      setDecks([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fetch decks when the component mounts and auth is initialized
  useEffect(() => {
    if (isInitialized) {
      fetchDecks();
    }
  }, [fetchDecks, isInitialized]);

  return {
    decks,
    isLoading,
    error,
    fetchDecks,
  };
} 