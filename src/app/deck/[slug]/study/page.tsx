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

// Helper function to format dates in a readable way
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  
  // Format date: Mar 5, 2023
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  
  return formattedDate
}

// Helper function to calculate and format time difference
const getTimeUntil = (dateString: string) => {
  const now = new Date()
  const futureDate = new Date(dateString)
  
  // Calculate difference in milliseconds
  const diffMs = futureDate.getTime() - now.getTime()
  
  // If less than an hour, show minutes
  if (diffMs < 60 * 60 * 1000) {
    const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)))
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} from now`
  }
  
  // Convert to hours
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  
  // If less than 24 hours, show hours
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} from now`
  }
  
  // Check if the date is tomorrow
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Compare just the date parts (ignoring time)
  const isTomorrow = 
    futureDate.getDate() === tomorrow.getDate() &&
    futureDate.getMonth() === tomorrow.getMonth() &&
    futureDate.getFullYear() === tomorrow.getFullYear()
  
  if (isTomorrow) {
    return 'tomorrow'
  }
  
  // Otherwise show days
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} from now`
}

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
    
    // Log the due date based on the response
    if (studyState.reviewMetrics) {
      const dueDate = studyState.reviewMetrics[response]
      console.log(`Next review due: ${dueDate}`)
    }
    
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
            <div className="flex flex-col items-center">
              <Button 
                variant="destructive" 
                size="lg"
                onClick={() => handleResponse('again')}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Again
              </Button>
              {studyState.reviewMetrics && (
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatDate(studyState.reviewMetrics.again)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getTimeUntil(studyState.reviewMetrics.again)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => handleResponse('hard')}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Hard
              </Button>
              {studyState.reviewMetrics && (
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatDate(studyState.reviewMetrics.hard)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getTimeUntil(studyState.reviewMetrics.hard)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <Button 
                variant="default" 
                size="lg"
                onClick={() => handleResponse('good')}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Good
              </Button>
              {studyState.reviewMetrics && (
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatDate(studyState.reviewMetrics.good)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getTimeUntil(studyState.reviewMetrics.good)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => handleResponse('easy')}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Easy
              </Button>
              {studyState.reviewMetrics && (
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatDate(studyState.reviewMetrics.easy)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getTimeUntil(studyState.reviewMetrics.easy)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 