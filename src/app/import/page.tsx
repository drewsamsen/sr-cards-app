"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth, useDecks } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Upload, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export default function ImportPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const { decks, isLoading: isLoadingDecks } = useDecks()
  const [csvContent, setCsvContent] = useState<string>("")
  const [selectedDeckId, setSelectedDeckId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  // Redirect to login page if not logged in
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login')
    }
  }, [user, router, isInitialized])

  // Set the first deck as selected when decks load
  useEffect(() => {
    if (decks.length > 0 && !selectedDeckId) {
      setSelectedDeckId(decks[0].id)
    }
  }, [decks, selectedDeckId])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    try {
      // This is a placeholder for the actual import logic
      // In a real implementation, you would call an API endpoint to process the import
      console.log("Importing data to deck:", selectedDeckId)
      console.log("CSV content:", csvContent)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess(true)
      setCsvContent("")
    } catch (err) {
      setError("An error occurred during import. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <h1 className="text-2xl font-bold tracking-tight">Import Flashcards</h1>
          <p className="text-muted-foreground">Import flashcards from CSV format.</p>
        </div>
        <div className="mt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Import successful!</AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Import Options</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deck-select">Select Deck</Label>
                  <Select 
                    value={selectedDeckId} 
                    onValueChange={setSelectedDeckId}
                    disabled={isLoadingDecks || decks.length === 0}
                  >
                    <SelectTrigger id="deck-select" className="w-full">
                      <SelectValue placeholder="Select a deck" />
                    </SelectTrigger>
                    <SelectContent>
                      {decks.map((deck) => (
                        <SelectItem key={deck.id} value={deck.id}>
                          {deck.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {decks.length === 0 && !isLoadingDecks && (
                    <p className="text-sm text-destructive">
                      You don't have any decks. Please create a deck first.
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="csv-content">CSV Content</Label>
                  <Textarea
                    id="csv-content"
                    placeholder="front,back
What is React?,A JavaScript library for building user interfaces
What is NextJS?,A React framework for production"
                    rows={10}
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    Format: front,back (one card per line)
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="flex items-center gap-2"
                    disabled={
                      isSubmitting || 
                      !csvContent.trim() || 
                      !selectedDeckId || 
                      isLoadingDecks
                    }
                  >
                    <Upload className="h-4 w-4" />
                    {isSubmitting ? "Importing..." : "Import Cards"}
                  </Button>
                </div>
              </form>
              
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium mb-2">Import Instructions</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Use comma-separated values with headers: front,back</li>
                  <li>Each line after the header represents one flashcard</li>
                  <li>All cards will be imported into the selected deck</li>
                  <li>Duplicate cards (same front and back) will be skipped</li>
                </ul>
                
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Need help? Check out our <a href="#" className="text-primary hover:underline">documentation</a> for more details.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 