"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { deckCardColumns } from "@/components/deck-card-columns"
import { Header } from "@/components/header"
import { useAuth, useDeck } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle, ChevronLeft, BookOpen } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui"
import Link from "next/link"

// Sample data for the table - this would be fetched from the API in a real app
const sampleCards = [
  {
    id: "1",
    front: "What is 2+2?",
    back: "4",
    status: "new",
    review_at: null,
  },
  {
    id: "2",
    front: "What is the capital of Spain?",
    back: "Madrid",
    status: "learning",
    review_at: "2023-04-15T10:30:00Z",
  },
  {
    id: "3",
    front: "Who wrote Romeo and Juliet?",
    back: "William Shakespeare",
    status: "review",
    review_at: "2023-04-12T14:00:00Z",
  },
  {
    id: "4",
    front: "What is photosynthesis?",
    back: "The process by which green plants and some other organisms use sunlight to synthesize foods with carbon dioxide and water.",
    status: "new",
    review_at: null,
  },
]

// Define the Card type to match the data structure
export interface DeckCard {
  id: string
  front: string
  back: string
  status: string
  review_at: string | null
  slug?: string
}

export default function DeckPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const { deck, isLoading: isLoadingDeck, error: deckError } = useDeck(params.slug)
  const [cards, setCards] = useState<DeckCard[]>(sampleCards)

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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <div className="mb-6">
          <Link 
            href="/decks" 
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to all decks
          </Link>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {isLoadingDeck ? "Loading..." : deck?.name || "Deck not found"}
          </h1>
          {deck?.description && (
            <p className="text-muted-foreground">{deck.description}</p>
          )}
        </div>
        
        <div className="mt-6">
          {deckError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {deckError}
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{deck?.name || "Cards"}</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex items-center gap-1"
                >
                  <BookOpen className="h-4 w-4" />
                  Study Now
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add new card
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={deckCardColumns} 
                data={cards} 
                searchPlaceholder="Search cards..." 
                emptyMessage={isLoadingDeck ? "Loading cards..." : "No flashcards found in this deck."}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 