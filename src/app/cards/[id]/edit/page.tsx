"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth, useCard } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ChevronRight, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { cardService, UpdateCardRequest } from "@/lib/api/services/card.service"

interface EditCardPageProps {
  params: {
    id: string;
  };
}

export default function EditCardPage({ params }: EditCardPageProps) {
  const { id } = params
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const { card, isLoading, error: fetchError } = useCard(id)
  
  // Form state
  const [front, setFront] = useState<string>("")
  const [back, setBack] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize form with card data when it loads
  useEffect(() => {
    if (card) {
      setFront(card.front)
      setBack(card.back)
    }
  }, [card])
  
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
      
      // Update card data
      const cardData: UpdateCardRequest = {
        front: front.trim(),
        back: back.trim()
      }
      
      // Submit to API
      const response = await cardService.updateCard(id, cardData)
      
      if (response.data.status === "success") {
        // Redirect to the deck page
        if (card?.deckId) {
          // Find the deck slug from the card's deckName
          const deckSlug = card.deckName?.toLowerCase().replace(/\s+/g, '-') || card.deckId
          router.push(`/deck/${deckSlug}`)
        } else {
          // Fallback to cards list if we can't determine the deck
          router.push('/cards')
        }
      } else {
        setError("Failed to update card")
      }
    } catch (err) {
      setError("An error occurred while updating the card")
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
            {card && (
              <>
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                <Link 
                  href={`/deck/${card.deckName?.toLowerCase().replace(/\s+/g, '-') || card.deckId}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {card.deckName || "Deck"}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            <span className="text-foreground font-medium">Edit Card</span>
          </nav>
        </div>
        
        <div className="mt-6 max-w-2xl mx-auto">
          {(error || fetchError) && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || fetchError}</AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Edit Card</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">Loading card information...</div>
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
                      onClick={() => router.back()}
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
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 