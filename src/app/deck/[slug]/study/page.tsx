"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, RotateCcw, Check, X } from "lucide-react"
import Link from "next/link"
import { deckService, CardReviewResponse, ReviewMetrics, DeckResponse } from "@/lib/api/services/deck.service"

// Interface for the study state
interface StudyState {
  card: CardReviewResponse | null;
  deck: DeckResponse | null;
  reviewMetrics: ReviewMetrics | null;
  isLoading: boolean;
  error: string | null;
}

export default function StudyPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const [isFlipped, setIsFlipped] = useState(false)
  const [studyState, setStudyState] = useState<StudyState>({
    card: null,
    deck: null,
    reviewMetrics: null,
    isLoading: true,
    error: null
  })

  // Fetch card for review
  const fetchCardForReview = async () => {
    try {
      setStudyState(prev => ({ ...prev, isLoading: true, error: null }))
      const response = await deckService.getCardForReview(params.slug)
      
      if (response.data.status === "success") {
        setStudyState({
          card: response.data.data.card,
          deck: response.data.data.deck,
          reviewMetrics: response.data.data.reviewMetrics,
          isLoading: false,
          error: null
        })
      } else {
        setStudyState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "Failed to load card" 
        }))
      }
    } catch (error) {
      console.error("Error fetching card for review:", error)
      setStudyState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Failed to load card" 
      }))
    }
  }

  // Redirect to login page if not logged in
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login')
    } else if (isInitialized && user) {
      fetchCardForReview()
    }
  }, [user, router, isInitialized, params.slug])

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
    
    // For now, just flip back to the front and fetch the next card
    setIsFlipped(false)
    fetchCardForReview()
  }

  // Show loading state while fetching card
  if (studyState.isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 md:py-10 flex items-center justify-center">
          <p>Loading card...</p>
        </main>
      </div>
    )
  }

  // Show error state if there was an error
  if (studyState.error) {
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
              Studying: {studyState.deck?.name || params.slug.replace(/-/g, ' ')}
            </h1>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-destructive">Error loading card. Please try again.</p>
            <Button onClick={fetchCardForReview} className="mt-4">Retry</Button>
          </div>
        </main>
      </div>
    )
  }

  // Show message if no cards to review
  if (!studyState.card) {
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
              Studying: {studyState.deck?.name || params.slug.replace(/-/g, ' ')}
            </h1>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-xl">No cards to review at this time!</p>
            <Link href={`/deck/${params.slug}`}>
              <Button className="mt-4">Back to Deck</Button>
            </Link>
          </div>
        </main>
      </div>
    )
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
            Studying: {studyState.deck?.name || params.slug.replace(/-/g, ' ')}
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
                  <p className="text-lg">{studyState.card.front}</p>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">Answer</h3>
                  <p className="text-lg">{studyState.card.back}</p>
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