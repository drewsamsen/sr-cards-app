"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { deckColumns } from "@/components/deck-columns"
import { useAuth, useDecks } from "@/lib/hooks"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageLayout } from "@/components/page-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Table, 
  TableBody, 
  TableCell, 
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
  // Display 4 skeleton rows to match a typical user with 4 decks
  const skeletonRows = Array(4).fill(0)
  const { /*isPhoneMode*/ } = usePhoneMode()
  
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-10 w-[96px] rounded-md" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-7 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {/* Add New row */}
            <TableRow>
              <TableCell>
                <Skeleton className="h-10 w-[96px] rounded-md bg-emerald-200 dark:bg-emerald-900" />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-7 w-[200px] bg-slate-300 dark:bg-slate-700" />
                  <Skeleton className="h-4 w-[220px] bg-slate-200 dark:bg-slate-800" />
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default function DecksPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const { decks: apiDecks, isLoading: isLoadingDecks, error: decksError, fetchDecks } = useDecks()
  const [decks, setDecks] = useState<Deck[]>([])
  const { /*isPhoneMode*/ } = usePhoneMode()

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
      }));
      
      // Add a special "add new deck" row
      const decksWithAddNew = [
        ...transformedDecks,
        {
          id: "new-deck",
          name: "",
          slug: "",
          remainingReviews: 0,
          totalCards: 0,
          newCards: 0,
          dueCards: 0
        }
      ];
      
      setDecks(decksWithAddNew);
    } else {
      // If no decks, still show the "add new" row
      setDecks([{
        id: "new-deck",
        name: "",
        slug: "",
        remainingReviews: 0,
        totalCards: 0,
        newCards: 0,
        dueCards: 0
      }]);
    }
  }, [apiDecks]);

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
            hideHeader={true}
          />
        </>
      )}
    </PageLayout>
  )
} 