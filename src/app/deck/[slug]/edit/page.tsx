"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ChevronRight, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { deckService, UpdateDeckRequest } from "@/lib/api/services/deck.service"

interface EditDeckPageProps {
  params: {
    slug: string;
  };
}

export default function EditDeckPage({ params }: EditDeckPageProps) {
  const { slug } = params
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  
  // Form state
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [deckId, setDeckId] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch deck data
  useEffect(() => {
    const fetchDeck = async () => {
      if (!slug || !isInitialized || !user) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await deckService.getDeckBySlug(slug)
        
        if (response.data.status === "success") {
          const deck = response.data.data.deck
          setName(deck.name)
          setDescription(deck.description)
          setDeckId(deck.id)
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
      if (!name.trim()) {
        setError("Deck name is required")
        return
      }
      
      // Update deck data
      const deckData: UpdateDeckRequest = {
        name: name.trim(),
        description: description.trim()
      }
      
      // Submit to API
      const response = await deckService.updateDeck(deckId, deckData)
      
      if (response.data.status === "success") {
        // Redirect to the deck page
        router.push(`/deck/${response.data.data.deck.slug}`)
      } else {
        setError("Failed to update deck")
      }
    } catch (err) {
      setError("An error occurred while updating the deck")
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
              {name || "Deck"}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            <span className="text-foreground font-medium">Edit</span>
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
              <CardTitle>Edit Deck</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">Loading deck information...</div>
              ) : (
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