"use client"

import { useState } from "react"
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
import { deckService, CreateDeckRequest } from "@/lib/api/services/deck.service"

export default function NewDeckPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  
  // Form state
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
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
      
      // Create deck data
      const deckData: CreateDeckRequest = {
        name: name.trim(),
        description: description.trim()
      }
      
      // Submit to API
      const response = await deckService.createDeck(deckData)
      
      if (response.data.status === "success") {
        // Redirect to the new deck page
        router.push(`/deck/${response.data.data.deck.slug}`)
      } else {
        setError("Failed to create deck")
      }
    } catch (err) {
      setError("An error occurred while creating the deck")
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
  
  // If still initializing, show loading state
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-10">
        <div className="mt-4 sm:mt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Create New Deck</CardTitle>
            </CardHeader>
            <CardContent>
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
                    onClick={() => router.push('/decks')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Creating..." : "Create Deck"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 