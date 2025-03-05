"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { deckCardColumns } from "@/components/deck-card-columns"
import { Header } from "@/components/header"
import { useAuth, useCards } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function CardsPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const { cards, isLoading: isLoadingCards, error: cardsError } = useCards()

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
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Your Flashcards</h1>
          <p className="text-muted-foreground">Browse and manage your flashcards across all decks.</p>
        </div>
        <div className="mt-6">
          {cardsError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {cardsError}
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Cards</CardTitle>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Create new card
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={deckCardColumns} 
                data={cards} 
                searchPlaceholder="Search cards..." 
                emptyMessage={isLoadingCards ? "Loading cards..." : "No flashcards found."}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 