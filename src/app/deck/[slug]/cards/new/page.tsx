"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ChevronRight, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { cardService, CreateCardRequest } from "@/lib/api/services/card.service"
import { deckService } from "@/lib/api/services/deck.service"

interface NewCardPageProps {
  params: {
    slug: string;
  };
}

export default function NewCardPage({ params }: NewCardPageProps) {
  const { slug } = params
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  
  // Form state
  const [front, setFront] = useState<string>("")
  const [back, setBack] = useState<string>("")
  const [deckId, setDeckId] = useState<string>("")
  const [deckName, setDeckName] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch deck data to get the deck ID
  useEffect(() => {
    const fetchDeck = async () => {
      if (!slug || !isInitialized || !user) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await deckService.getDeckBySlug(slug)
        
        if (response.data.status === "success") {
          const deck = response.data.data.deck
          setDeckId(deck.id)
          setDeckName(deck.name)
        } else {
          setError("Failed to load deck")
        }
      } catch (err) {
        setError("An error occurred while loading the deck")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDeck()
  }, [slug, isInitialized, user])
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      setIsSubmitting(true)
      
      // Validate form
      if (!front.trim()) {
        setError("Front side content is required")
        return
      }
      
      if (!back.trim()) {
        setError("Back side content is required")
        return
      }
      
      // Create card data
      const cardData: CreateCardRequest = {
        front: front.trim(),
        back: back.trim()
      }
      
      // Submit to API
      const response = await cardService.createCard(deckId, cardData)
      
      if (response.data.status === "success") {
        // Redirect to the deck page
        router.push(`/deck/${slug}`)
      } else {
        setError("Failed to create card")
      }
    } catch (err) {
      setError("An error occurred while creating the card")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Redirect to login page if not logged in
  if (isInitialized && !user) {
    router.push('/login')
    return null
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
            <Link 
              href={`/deck/${slug}`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {deckName || "Deck"}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            <span className="text-foreground font-medium">Add Card</span>
          </nav>
        </div>
        
        <div className="mt-6 max-w-2xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Add New Card to {deckName}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">Loading deck information...</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="front">Front Side</Label>
                    <Textarea
                      id="front"
                      value={front}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFront(e.target.value)}
                      placeholder="Enter the question or prompt..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="back">Back Side</Label>
                    <Textarea
                      id="back"
                      value={back}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBack(e.target.value)}
                      placeholder="Enter the answer or explanation..."
                      rows={6}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/deck/${slug}`)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      <Save className="h-4 w-4" />
                      {isSubmitting ? "Creating..." : "Create Card"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 