"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cardService, UpdateCardRequest } from "@/lib/api/services/card.service"
import { SingleCard } from "@/lib/hooks/useCard"

// Custom DialogContent component for mobile positioning
function MobileDialogContent({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    
    // Apply styles to the dialog content
    if (contentRef.current && isMobile) {
      const style = contentRef.current.style;
      style.position = 'fixed';
      style.top = '5%';
      style.left = '50%';
      style.transform = 'translateX(-50%)';
      style.width = 'calc(100% - 32px)';
      style.maxHeight = '90vh';
      style.overflowY = 'auto';
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  return (
    <DialogContent ref={contentRef} className={`sm:max-w-[500px] ${className}`}>
      {children}
    </DialogContent>
  );
}

interface CardEditModalProps {
  card: SingleCard | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCardUpdated: () => void
}

export function CardEditModal({ 
  card, 
  isOpen, 
  onOpenChange, 
  onCardUpdated 
}: CardEditModalProps) {
  // Form state
  const [front, setFront] = useState<string>("")
  const [back, setBack] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize form with card data when it loads or changes
  useEffect(() => {
    if (card) {
      setFront(card.front)
      setBack(card.back)
    }
  }, [card])
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null)
    }
  }, [isOpen])
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!card) return
    
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
      const response = await cardService.updateCard(card.id, cardData)
      
      if (response.data.status === "success") {
        // Close modal and notify parent component
        onOpenChange(false)
        onCardUpdated()
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <MobileDialogContent>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </MobileDialogContent>
    </Dialog>
  )
} 