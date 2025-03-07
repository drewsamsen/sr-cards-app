"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { deckCardColumns } from "@/components/deck-card-columns"
import { Header } from "@/components/header"
import { useAuth, useDeck, useDeckCards } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, AlertCircle, BookOpen, ChevronRight, Save, Edit, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import React from "react"
import { deckService, UpdateDeckRequest } from "@/lib/api/services/deck.service"

// Define the Card type to match the data structure
export interface DeckCard {
  id: string
  front: string
  back: string
  status: string
  review_at: string | null
  state?: number
  difficulty?: number
  stability?: number
  due?: string | null
  slug?: string
}

export default function DeckPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  
  // Edit form state
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<boolean>(false)
  
  // TODO: In future Next.js versions, params will need to be unwrapped with React.use()
  // before accessing properties. For now, direct access is still supported.
  const { deck, isLoading: isLoadingDeck, error: deckError, refetch: refetchDeck } = useDeck(params.slug)
  const { 
    cards, 
    isLoading: isLoadingCards, 
    error: cardsError 
  } = useDeckCards(deck?.id)

  // Initialize form with deck data when it loads
  useEffect(() => {
    if (deck) {
      setName(deck.name)
      setDescription(deck.description || "")
    }
  }, [deck])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(false)
    
    try {
      setIsSubmitting(true)
      
      // Validate form
      if (!name.trim()) {
        setFormError("Deck name is required")
        return
      }
      
      // Update deck data
      const deckData: UpdateDeckRequest = {
        name: name.trim(),
        description: description.trim()
      }
      
      // Submit to API
      const response = await deckService.updateDeck(deck?.id || "", deckData)
      
      if (response.data.status === "success") {
        setFormSuccess(true)
        setIsEditing(false)
        // Refetch deck data to update the UI
        refetchDeck()
      } else {
        setFormError("Failed to update deck")
      }
    } catch (err) {
      setFormError("An error occurred while updating the deck")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

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
          
          {formError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formError}
              </AlertDescription>
            </Alert>
          )}
          
          {formSuccess && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Deck updated successfully!</AlertDescription>
            </Alert>
          )}
          
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                {isEditing ? "Edit Deck" : (isLoadingDeck ? "Loading..." : deck?.name || "Deck not found")}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 w-8 p-0"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Deck Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                      placeholder="e.g. JavaScript Basics"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                      placeholder="Describe what this deck is about..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      <Save className="h-4 w-4" />
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  {deck?.description ? (
                    <p className="text-muted-foreground">{deck.description}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No description provided</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
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
                      asChild
                    >
                      <Link href={`/deck/${params.slug}/cards/new`}>
                        <Plus className="h-4 w-4" />
                        Add new card
                      </Link>
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