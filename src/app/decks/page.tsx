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
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { usePhoneMode } from "@/components/page-layout"

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

// Create a DeckTableSkeleton component for loading state
function DeckTableSkeleton() {
  // Display 3 skeleton rows to match a typical user with 3 decks
  const skeletonRows = Array(3).fill(0)
  const { isPhoneMode } = usePhoneMode()
  
  return (
    <div className="w-full">
      {/* Search and header section skeleton */}
      <div className="flex items-center justify-between py-4">
        <Skeleton className={`h-8 ${isPhoneMode ? 'w-[100px]' : 'w-[250px]'}`} />
        {/* In phone mode, only show one button */}
        <div className="flex items-center gap-1">
          {!isPhoneMode && <Skeleton className="h-9 w-9 rounded-md" />}
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Hide first column in phone mode */}
              {!isPhoneMode && (
                <TableHead style={{ width: "70px" }}>
                  <Skeleton className="h-8 w-8" />
                </TableHead>
              )}
              <TableHead>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-16" />
                  {!isPhoneMode && <Skeleton className="h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead style={{ width: isPhoneMode ? "40px" : "50px" }}>
                <Skeleton className="h-7 w-7" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                {/* Hide first column in phone mode */}
                {!isPhoneMode && (
                  <TableCell>
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </TableCell>
                )}
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className={`h-5 ${isPhoneMode ? 'w-[80px]' : 'w-[200px]'}`} />
                    {/* Only show one line of text in phone mode */}
                    {!isPhoneMode && <Skeleton className="h-4 w-[150px]" />}
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-7 w-7 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Footer/pagination skeleton - simplified in phone mode */}
      {!isPhoneMode ? (
        <div className="flex items-center justify-between space-x-2 py-4">
          <Skeleton className="h-9 w-[250px]" />
          <Skeleton className="h-9 w-[150px]" />
        </div>
      ) : (
        <div className="flex justify-end space-x-2 py-3">
          <Skeleton className="h-7 w-[60px]" />
        </div>
      )}
      
      {/* Button skeleton */}
      <div className="flex justify-end mt-4">
        <Skeleton className={`h-9 ${isPhoneMode ? 'w-[100px]' : 'w-[150px]'} rounded-md`} />
      </div>
    </div>
  )
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
      
      {isLoadingDecks ? (
        <DeckTableSkeleton />
      ) : (
        <>
          <DataTable 
            columns={deckColumns} 
            data={decks} 
            searchPlaceholder="Search decks..." 
            emptyMessage="No flashcard decks found."
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
        </>
      )}
    </PageLayout>
  )
} 