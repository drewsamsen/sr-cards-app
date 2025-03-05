"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/columns"
import { Header } from "@/components/header"
import { useAuth, useDecks } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui"

// Define the Deck type to match the data structure
export interface Deck {
  id: string
  name: string
  slug: string
  due: number
  total: number
}

export default function DecksPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const { decks: apiDecks, isLoading: isLoadingDecks, error: decksError } = useDecks()
  const [decks, setDecks] = useState<Deck[]>([])

  // Transform API decks to our Deck format
  useEffect(() => {
    if (apiDecks.length > 0) {
      // In a real app, we would fetch the due and total counts from another API endpoint
      // For now, we'll generate random numbers
      const transformedDecks = apiDecks.map(deck => ({
        id: deck.id,
        name: deck.name,
        slug: deck.slug,
        due: Math.floor(Math.random() * 10), // Random number for demo
        total: Math.floor(Math.random() * 50) + 10, // Random number for demo
      }))
      setDecks(transformedDecks)
    }
  }, [apiDecks])

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
          <h1 className="text-2xl font-bold tracking-tight">Your Flashcard Decks</h1>
          <p className="text-muted-foreground">Browse and manage your flashcard decks.</p>
        </div>
        <div className="mt-6">
          {decksError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {decksError}
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Decks</CardTitle>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Create new deck
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns} 
                data={decks} 
                searchPlaceholder="Search decks..." 
                emptyMessage={isLoadingDecks ? "Loading decks..." : "No flashcard decks found."}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 