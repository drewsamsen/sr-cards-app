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
import { AlertCircle, Save, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cardService, UpdateCardRequest } from "@/lib/api/services/card.service"
import { SingleCard } from "@/lib/hooks/useCard"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  onCardDeleted?: () => void
}

export function CardEditModal({ 
  card, 
  isOpen, 
  onOpenChange, 
  onCardUpdated,
  onCardDeleted 
}: CardEditModalProps) {
  // Form state
  const [front, setFront] = useState<string>("")
  const [back, setBack] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  
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
  
  // Handle delete card
  const handleDeleteCard = async () => {
    if (!card) return
    
    try {
      setIsDeleting(true)
      
      // Call the API to delete the card
      const response = await cardService.deleteCard(card.id)
      
      if (response.data.status === "success") {
        // Close both dialogs and notify parent component
        setIsDeleteDialogOpen(false)
        onOpenChange(false)
        
        // Notify parent that card was deleted
        if (onCardDeleted) {
          onCardDeleted()
        }
      } else {
        setError("Failed to delete card")
        setIsDeleteDialogOpen(false)
      }
    } catch (err) {
      setError("An error occurred while deleting the card")
      setIsDeleteDialogOpen(false)
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }
  
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
    <>
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
            
            <DialogFooter className="pt-4 grid grid-cols-[auto_1fr_1fr] gap-2 w-full">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isSubmitting || isDeleting}
                className="h-9 w-9 flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                size="sm"
                disabled={isSubmitting || isDeleting}
                className="flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{isSubmitting ? "Saving..." : "Save"}</span>
              </Button>
            </DialogFooter>
          </form>
        </MobileDialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the card from your deck.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteCard()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 