"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { deckColumns } from "@/components/deck-columns"
import { useAuth, useDecks } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageLayout } from "@/components/page-layout"

// Define the Deck type to match the data structure
export interface Deck {
  id: string
  name: string
  slug: string
  remainingReviews: number
  totalCards: number
  newCards: number
  dueCards: number
}

export default function DecksPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const { decks: apiDecks, isLoading: isLoadingDecks, error: decksError, fetchDecks } = useDecks()
  const [decks, setDecks] = useState<Deck[]>([])

  // Transform API decks to our Deck format
  useEffect(() => {
    if (apiDecks.length > 0) {
      const transformedDecks = apiDecks.map(deck => ({
        id: deck.id,
        name: deck.name,
        slug: deck.slug,
        remainingReviews: deck.remainingReviews || 0,
        totalCards: deck.totalCards || 0,
        newCards: deck.newCards || 0,
        dueCards: deck.dueCards || 0
      }))
      setDecks(transformedDecks)
    }
  }, [apiDecks])

  // Set up periodic refetching (every 10 minutes)
  useEffect(() => {
    if (!user) return;
    
    // Refetch every 10 minutes
    const intervalId = setInterval(() => {
      fetchDecks();
    }, 10 * 60 * 1000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [user, fetchDecks]);
  
  // Set up visibility change detection
  useEffect(() => {
    if (!user) return;
    
    // Function to handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDecks();
      }
    };
    
    // Add event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchDecks]);

  // Redirect to login page if not logged in
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login')
    }
  }, [user, router, isInitialized])

  // If not logged in or still initializing, show loading state
  if (!isInitialized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <PageLayout>
      {decksError && (
        <Alert variant="destructive" className="mb-4 sm:mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {decksError}
          </AlertDescription>
        </Alert>
      )}
      
      <DataTable 
        columns={deckColumns} 
        data={decks} 
        searchPlaceholder="Search decks..." 
        emptyMessage={isLoadingDecks ? "Loading decks..." : "No flashcard decks found."}
        hideSearch={true}
      />
      
      <div className="flex justify-end mt-4 sm:mt-6">
        <Button 
          onClick={() => router.push('/decks/new')}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Create new deck
        </Button>
      </div>
    </PageLayout>
  )
} 