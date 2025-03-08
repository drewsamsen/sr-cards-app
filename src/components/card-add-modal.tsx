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
import { AlertCircle, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cardService, CreateCardRequest } from "@/lib/api/services/card.service"

interface CardAddModalProps {
  deckId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCardAdded: () => void
}

export function CardAddModal({ 
  deckId, 
  isOpen, 
  onOpenChange, 
  onCardAdded 
}: CardAddModalProps) {
  // Form state
  const [front, setFront] = useState<string>("")
  const [back, setBack] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Reset form when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setError(null)
    } else {
      // Clear form when opening
      setFront("")
      setBack("")
    }
  }, [isOpen])
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!deckId) return
    
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
              disabled={isSubmitting}
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