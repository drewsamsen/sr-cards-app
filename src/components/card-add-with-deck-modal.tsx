"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cardService, CreateCardRequest } from "@/lib/api/services/card.service"
import { useDecks } from "@/lib/hooks"

interface CardAddWithDeckModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCardAdded: () => void
}

export function CardAddWithDeckModal({ 
  isOpen, 
  onOpenChange, 
  onCardAdded 
}: CardAddWithDeckModalProps) {
  // Form state
  const [front, setFront] = useState<string>("")
  const [back, setBack] = useState<string>("")
  const [selectedDeckId, setSelectedDeckId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get decks for the dropdown
  const { decks, isLoading: isLoadingDecks } = useDecks()
  
  // Reset form when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setError(null)
    } else {
      // Clear form when opening
      setFront("")
      setBack("")
      // Set the first deck as selected when decks load
      if (decks.length > 0 && !selectedDeckId) {
        setSelectedDeckId(decks[0].id)
      }
    }
  }, [isOpen, decks, selectedDeckId])
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!selectedDeckId) {
      setError("Please select a deck")
      return
    }
    
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
      const response = await cardService.createCard(selectedDeckId, cardData)
      
      if (response.data.status === "success") {
        // Clear form
        setFront("")
        setBack("")
        
        // Close modal and notify parent component
        onOpenChange(false)
        onCardAdded()
      } else {
        setError("Failed to create card")
      }
    } catch (err) {
      // Handle duplicate card error
      if (err instanceof Error && 'status' in err && err.status === 409) {
        // Extract the message from the error data
        const errorData = (err as any).data
        let errorMessage = "A similar card already exists in this deck"
        
        // If we have more specific error data, use it
        if (errorData?.message) {
          // Remove technical prefix if present
          errorMessage = errorData.message.replace("Duplicate card detected: ", "")
          // Add a user-friendly prefix
          errorMessage = `Duplicate Card: ${errorMessage}`
        }
        
        setError(errorMessage)
      } else {
        setError("An error occurred while creating the card")
      }
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.startsWith("Duplicate Card:") ? (
                  <span className="font-medium">{error}</span>
                ) : (
                  error
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="deck">Deck</Label>
            <Select
              value={selectedDeckId}
              onValueChange={setSelectedDeckId}
              disabled={isLoadingDecks || decks.length === 0}
            >
              <SelectTrigger id="deck">
                <SelectValue placeholder="Select a deck" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingDecks ? (
                  <SelectItem value="loading" disabled>Loading decks...</SelectItem>
                ) : decks.length === 0 ? (
                  <SelectItem value="none" disabled>No decks available</SelectItem>
                ) : (
                  decks.map(deck => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="front">Front Side</Label>
            <Textarea
              id="front"
              value={front}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFront(e.target.value)}
              placeholder="Enter the question or prompt..."
              rows={3}
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
              rows={4}
              required
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex items-center gap-2"
              disabled={isSubmitting || isLoadingDecks || decks.length === 0}
            >
              <Plus className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 