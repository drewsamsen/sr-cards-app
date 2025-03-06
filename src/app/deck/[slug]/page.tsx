"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { deckCardColumns } from "@/components/deck-card-columns"
import { Header } from "@/components/header"
import { useAuth, useDeck, useDeckCards } from "@/lib/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle, BookOpen, ChevronRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import React from "react"

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
  
  // TODO: In future Next.js versions, params will need to be unwrapped with React.use()
  // before accessing properties. For now, direct access is still supported.
  const { deck, isLoading: isLoadingDeck, error: deckError } = useDeck(params.slug)
  const { 
    cards, 
    isLoading: isLoadingCards, 
    error: cardsError 
  } = useDeckCards(deck?.id)

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
          <nav className="flex items-center text-sm">
            <Link 
              href="/decks" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Decks
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            <span className="text-foreground font-medium">
              {isLoadingDeck ? "Loading..." : deck?.name || "Deck not found"}
            </span>
          </nav>
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
          
          {cardsError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {cardsError}
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardContent className="pt-3 px-6 pb-6">
              <DataTable 
                columns={deckCardColumns} 
                data={cards} 
                searchPlaceholder="Search cards..." 
                emptyMessage={
                  isLoadingDeck 
                    ? "Loading deck..." 
                    : isLoadingCards 
                      ? "Loading cards..." 
                      : "No flashcards found in this deck."
                }
                actionButton={
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center gap-1"
                      disabled={isLoadingCards || cards.length === 0}
                      asChild
                    >
                      <Link href={`/deck/${params.slug}/study`}>
                        <BookOpen className="h-4 w-4" />
                        Study Now
                      </Link>
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
                }
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 