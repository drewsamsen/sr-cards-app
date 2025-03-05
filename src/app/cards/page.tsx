"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { cardColumns } from "@/components/card-columns"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Sample data for the table - this would be fetched from the API in a real app
const data = [
  {
    id: "1",
    question: "What is 2+2?",
    slug: "what-is-2-plus-2",
    lastReviewed: "2 days ago",
    deck: "Basic Math",
    difficulty: 1,
  },
  {
    id: "2",
    question: "What is the capital of Spain?",
    slug: "what-is-the-capital-of-spain",
    lastReviewed: "1 week ago",
    deck: "World Geography",
    difficulty: 2,
  },
  {
    id: "3",
    question: "Who wrote Romeo and Juliet?",
    slug: "who-wrote-romeo-and-juliet",
    lastReviewed: "3 days ago",
    deck: "English Literature",
    difficulty: 2,
  },
  {
    id: "4",
    question: "What is photosynthesis?",
    slug: "what-is-photosynthesis",
    lastReviewed: "Never",
    deck: "Biology 101",
    difficulty: 3,
  },
  {
    id: "5",
    question: "How do you say 'hello' in Spanish?",
    slug: "how-do-you-say-hello-in-spanish",
    lastReviewed: "5 days ago",
    deck: "Spanish Vocabulary",
    difficulty: 1,
  },
  {
    id: "6",
    question: "What is the first law of thermodynamics?",
    slug: "what-is-the-first-law-of-thermodynamics",
    lastReviewed: "2 weeks ago",
    deck: "Physics Fundamentals",
    difficulty: 4,
  },
  {
    id: "7",
    question: "What is a variable in programming?",
    slug: "what-is-a-variable-in-programming",
    lastReviewed: "1 day ago",
    deck: "Programming Concepts",
    difficulty: 2,
  },
  {
    id: "8",
    question: "What is the Pythagorean theorem?",
    slug: "what-is-the-pythagorean-theorem",
    lastReviewed: "4 days ago",
    deck: "Basic Math",
    difficulty: 3,
  },
]

// Define the Card type to match the data structure
export interface FlashCard {
  id: string
  question: string
  slug: string
  lastReviewed: string
  deck: string
  difficulty: number
}

export default function CardsPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()

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
                columns={cardColumns} 
                data={data} 
                searchPlaceholder="Search cards..." 
                emptyMessage="No flashcards found."
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 