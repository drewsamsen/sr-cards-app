"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, RotateCcw, Check, X } from "lucide-react"
import Link from "next/link"

// Dummy data for a single card
const dummyCard = {
  id: "1",
  front: "What is Git rebase?",
  back: "Git rebase is a command that allows you to reapply commits on top of another base branch. Unlike merging, rebasing flattens the history, creating a linear progression of commits.",
  status: "review",
  review_at: new Date().toISOString(),
}

export default function StudyPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const [isFlipped, setIsFlipped] = useState(false)
  const [currentCard, setCurrentCard] = useState(dummyCard)

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

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleResponse = (response: 'again' | 'hard' | 'good' | 'easy') => {
    // In a real app, this would update the card status and schedule the next review
    console.log(`Response: ${response}`)
    
    // For now, just flip back to the front
    setIsFlipped(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <div className="mb-6">
          <Link 
            href={`/deck/${params.slug}`} 
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to deck
          </Link>
        </div>
        
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Studying: {params.slug.replace(/-/g, ' ')}
          </h1>
          <p className="text-muted-foreground">
            Click on the card to reveal the answer
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center">
          <Card 
            className="w-full max-w-2xl min-h-[16rem] md:min-h-[20rem] cursor-pointer transition-all duration-300"
            onClick={handleFlip}
          >
            <CardContent className="p-6 h-full flex flex-col items-center justify-center">
              {!isFlipped ? (
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">Question</h3>
                  <p className="text-lg">{currentCard.front}</p>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">Answer</h3>
                  <p className="text-lg">{currentCard.back}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className={`mt-8 flex flex-wrap gap-3 justify-center transition-opacity duration-300 ${
            isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}>
            <Button 
              variant="destructive" 
              size="lg"
              onClick={() => handleResponse('again')}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Again
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleResponse('hard')}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Hard
            </Button>
            <Button 
              variant="default" 
              size="lg"
              onClick={() => handleResponse('good')}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Good
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => handleResponse('easy')}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Easy
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
} 