"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Lightbulb } from "lucide-react"
import { formatMarkdown } from "@/lib/utils"

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
    <DialogContent ref={contentRef} className={`sm:max-w-[600px] ${className}`}>
      {children}
    </DialogContent>
  );
}

interface CardAIExplanationModalProps {
  explanation: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
}

export function CardAIExplanationModal({ 
  explanation,
  isOpen, 
  onOpenChange,
  isLoading
}: CardAIExplanationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <MobileDialogContent>
        <DialogHeader className="pb-2">
          <div className="flex items-center mb-1">
            <Lightbulb className="h-5 w-5 text-primary mr-2" />
            <DialogTitle>AI Explanation</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="py-2 space-y-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Generating...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="bg-card border p-4 rounded-md">
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {formatMarkdown(explanation)}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="pt-4">
          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </MobileDialogContent>
    </Dialog>
  )
} 