"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/columns"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Sample data for the table - this would be fetched from the API in a real app
const data = [
  {
    id: "1",
    name: "Basic Math",
    slug: "basic-math",
    due: 12,
    total: 45,
  },
  {
    id: "2",
    name: "Spanish Vocabulary",
    slug: "spanish-vocabulary",
    due: 0,
    total: 32,
  },
  {
    id: "3",
    name: "World History",
    slug: "world-history",
    due: 5,
    total: 18,
  },
  {
    id: "4",
    name: "Biology 101",
    slug: "biology-101",
    due: 0,
    total: 12,
  },
  {
    id: "5",
    name: "Programming Concepts",
    slug: "programming-concepts",
    due: 7,
    total: 27,
  },
  {
    id: "6",
    name: "English Literature",
    slug: "english-literature",
    due: 0,
    total: 53,
  },
  {
    id: "7",
    name: "Physics Fundamentals",
    slug: "physics-fundamentals",
    due: 2,
    total: 8,
  },
  {
    id: "8",
    name: "Music Theory",
    slug: "music-theory",
    due: 6,
    total: 22,
  },
]

// Define the Product type to match the data structure
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Decks</CardTitle>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Create new deck
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={data} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 