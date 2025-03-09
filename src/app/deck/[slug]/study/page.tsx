"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw, Check, X, ChevronRight, Edit, Star } from "lucide-react"
import Link from "next/link"
import { deckService, CardReviewResponse, ReviewMetrics, DeckResponse, DailyProgress } from "@/lib/api/services/deck.service"
import { cardService } from "@/lib/api/services/card.service"
import { CardEditModal } from "@/components/card-edit-modal"

// Helper function to calculate and format time difference
const getTimeUntil = (dateString: string) => {
  const now = new Date()
  const futureDate = new Date(dateString)
  
  // Calculate difference in milliseconds
  const diffMs = futureDate.getTime() - now.getTime()
  
  // If less than an hour, show minutes
  if (diffMs < 60 * 60 * 1000) {
    const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)))
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`
  }
  
  // Convert to hours
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  
  // If less than 24 hours, show hours
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`
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
  return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
}

// Define the study state interface
interface StudyState {
  card: CardReviewResponse | null
  deck: DeckResponse | null
  reviewMetrics: ReviewMetrics | null
  isLoading: boolean
  error: string | null
  message?: string
  dailyProgress?: DailyProgress
}

export default function StudyPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const { slug } = params;
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
  
  // Card edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Fetch card for review
  const fetchCardForReview = useCallback(async () => {
    try {
      setStudyState(prev => ({ ...prev, isLoading: true, error: null }))
      const response = await deckService.getCardForReview(slug)
      
      if (response.data.status === "success") {
        // Check which scenario we have
        if (response.data.data.card) {
          // Scenario 1: Card available for review
          const newState: StudyState = {
            card: response.data.data.card,
            deck: response.data.data.deck,
            reviewMetrics: response.data.data.reviewMetrics || null,
            isLoading: false,
            error: null
          }
          
          setStudyState(newState)
        } else if (response.data.data.dailyLimitReached) {
          // Scenario 2: Daily limit reached
          setStudyState(prev => ({ 
            ...prev, 
            deck: response.data.data.deck,
            isLoading: false, 
            error: "daily_limit_reached",
            message: response.data.data.message || "You've reached your daily review limits for this deck. Come back later!",
            dailyProgress: response.data.data.dailyProgress
          }))
        } else if (response.data.data.allCaughtUp) {
          // Scenario 3: All caught up - no cards due for review
          setStudyState(prev => ({ 
            ...prev, 
            deck: response.data.data.deck,
            isLoading: false, 
            error: "all_caught_up",
            message: response.data.data.message || "You're all caught up! No cards due for review at this time."
          }))
        } else if (response.data.data.emptyDeck) {
          // Scenario 4: Empty deck - no cards in the deck
          setStudyState(prev => ({ 
            ...prev, 
            deck: response.data.data.deck,
            isLoading: false, 
            error: "empty_deck",
            message: response.data.data.message || "This deck doesn't have any cards yet. Add some cards to start reviewing!"
          }))
        } else {
          // Fallback for unexpected response format
          setStudyState(prev => ({ 
            ...prev, 
            deck: response.data.data.deck,
            isLoading: false, 
            error: "Failed to load card" 
          }))
        }
      } else {
        // Error response
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
  }, [slug])
  
  // Redirect to login page if not logged in
  useEffect(() => {
    if (!isInitialized) {
      return
    }
    
    if (!user) {
      router.push('/login')
    } else if (isInitialized && user) {
      fetchCardForReview()
    }
  }, [user, router, isInitialized, slug, fetchCardForReview])

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
  
  const handleEditClick = (e: React.MouseEvent) => {
    // Prevent the card from flipping when clicking the edit button
    e.stopPropagation()
    setIsEditModalOpen(true)
  }
  
  const handleCardUpdated = async () => {
    // Refresh the current card to show the updated content
    if (studyState.card) {
      try {
        const response = await cardService.getCard(studyState.card.id)
        if (response.data.status === "success") {
          // Update the card in the study state
          setStudyState(prev => ({
            ...prev,
            card: {
              ...prev.card!,
              front: response.data.data.card.front,
              back: response.data.data.card.back
            }
          }))
        }
      } catch (error) {
        console.error("Error fetching updated card:", error)
      }
    }
  }

  const handleResponse = async (response: 'again' | 'hard' | 'good' | 'easy') => {
    if (!studyState.card) return
    
    // Map the response to a rating number
    const ratingMap = {
      'again': 1,
      'hard': 2,
      'good': 3,
      'easy': 4
    }
    
    const rating = ratingMap[response]
    
    try {
      // Log the due date based on the response
      if (studyState.reviewMetrics) {
        const dueDate = studyState.reviewMetrics[response]
        console.log(`Next review due: ${dueDate}`)
      }
      
      // Submit the review to the API
      await cardService.reviewCard(studyState.card.id, { rating })
      
      // Flip back to the front and fetch the next card
      setIsFlipped(false)
      fetchCardForReview()
    } catch (error) {
      console.error("Error submitting card review:", error)
      // Still fetch the next card even if there was an error
      setIsFlipped(false)
      fetchCardForReview()
    }
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
            <nav className="flex items-center text-sm">
              <Link 
                href="/decks" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Decks
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              <Link 
                href={`/deck/${slug}`} 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {studyState.deck?.name || slug.replace(/-/g, ' ')}
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              <span className="text-foreground font-medium">Study</span>
            </nav>
          </div>
          <div className="flex flex-col items-center justify-center">
            {studyState.error === "empty_deck" ? (
              <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                <div className="w-full bg-card text-card-foreground rounded-lg border shadow-lg overflow-hidden">
                  <div className="bg-primary/10 p-6 flex flex-col items-center">
                    <div className="rounded-full bg-primary/20 p-3 mb-4">
                      <RotateCcw className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-2">Empty Deck</h2>
                    <p className="text-center text-muted-foreground">
                      {studyState.message || "This deck doesn't have any cards yet. Add some cards to start reviewing!"}
                    </p>
                  </div>
                  
                  <div className="p-6 flex flex-col items-center">
                    <div className="space-y-4 w-full">
                      <Link href={`/deck/${slug}`} className="w-full">
                        <Button className="w-full">Back to Deck</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : studyState.error === "all_caught_up" ? (
              <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                <div className="w-full bg-card text-card-foreground rounded-lg border shadow-lg overflow-hidden">
                  <div className="bg-primary/10 p-6 flex flex-col items-center">
                    <div className="rounded-full bg-primary/20 p-3 mb-4">
                      <Check className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-2">Great job!</h2>
                    <p className="text-center text-muted-foreground">
                      {studyState.message || "You've completed all your reviews for now. Check back later for more."}
                    </p>
                  </div>
                  
                  <div className="p-6 flex flex-col items-center">
                    <div className="flex items-center justify-center space-x-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    
                    <div className="space-y-4 w-full">
                      <Link href={`/deck/${slug}`} className="w-full">
                        <Button className="w-full">Back to Deck</Button>
                      </Link>
                      <Link href="/decks" className="w-full">
                        <Button variant="outline" className="w-full">View All Decks</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : studyState.error === "daily_limit_reached" ? (
              <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                <div className="w-full bg-card text-card-foreground rounded-lg border shadow-lg overflow-hidden">
                  <div className="bg-primary/10 p-6 flex flex-col items-center">
                    <div className="rounded-full bg-primary/20 p-3 mb-4">
                      <X className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-2">Daily Limit Reached</h2>
                    <p className="text-center text-muted-foreground">
                      {studyState.message || "You've reached your daily review limits for this deck. Come back later!"}
                    </p>
                  </div>
                  
                  {studyState.dailyProgress && (
                    <div className="px-6 pt-4">
                      <h3 className="font-medium mb-2 text-center">Daily Progress</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm bg-muted p-4 rounded-lg">
                        <div className="flex flex-col items-center">
                          <p className="text-muted-foreground">New Cards</p>
                          <p className="font-medium text-lg">{studyState.dailyProgress.newCardsSeen} / {studyState.dailyProgress.newCardsLimit}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <p className="text-muted-foreground">Reviews</p>
                          <p className="font-medium text-lg">{studyState.dailyProgress.reviewCardsSeen} / {studyState.dailyProgress.reviewCardsLimit}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col items-center">
                    <div className="space-y-4 w-full">
                      <Link href={`/deck/${slug}`} className="w-full">
                        <Button className="w-full">Back to Deck</Button>
                      </Link>
                      <Link href="/decks" className="w-full">
                        <Button variant="outline" className="w-full">View All Decks</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                <div className="w-full bg-card text-card-foreground rounded-lg border shadow-lg overflow-hidden">
                  <div className="bg-destructive/10 p-6 flex flex-col items-center">
                    <div className="rounded-full bg-destructive/20 p-3 mb-4">
                      <X className="h-8 w-8 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-2">Error</h2>
                    <p className="text-center text-muted-foreground">
                      {studyState.message || "An error occurred while loading cards. Please try again."}
                    </p>
                  </div>
                  
                  <div className="p-6 flex flex-col items-center">
                    <div className="space-y-4 w-full">
                      <Button 
                        className="w-full" 
                        onClick={() => fetchCardForReview()}
                      >
                        Try Again
                      </Button>
                      <Link href={`/deck/${slug}`} className="w-full">
                        <Button variant="outline" className="w-full">Back to Deck</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            <nav className="flex items-center text-sm">
              <Link 
                href="/decks" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Decks
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              <Link 
                href={`/deck/${slug}`} 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {studyState.deck?.name || slug.replace(/-/g, ' ')}
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              <span className="text-foreground font-medium">Study</span>
            </nav>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-xl">You are all caught up</p>
            <Link href={`/deck/${slug}`}>
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
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 flex flex-col">
        <div className="mb-6">
          <nav className="flex items-center text-sm">
            <Link 
              href="/decks" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Decks
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            <Link 
              href={`/deck/${slug}`} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {studyState.deck?.name || slug.replace(/-/g, ' ')}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            <span className="text-foreground font-medium">Study</span>
          </nav>
        </div>
        
        <div className="flex flex-col items-center justify-between flex-grow">
          {/* Make this entire area clickable for flipping the card */}
          <div className="w-full flex-grow flex flex-col items-center cursor-pointer" onClick={handleFlip}>
            <div className="w-full flex justify-center">
              <Card 
                className="w-full max-w-2xl min-h-[16rem] md:min-h-[20rem] cursor-pointer transition-all duration-300 relative flex flex-col"
                onClick={handleFlip}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-70 hover:opacity-100 z-10"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card flip when clicking edit
                    handleEditClick(e);
                  }}
                  title="Edit card"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <CardContent className="p-6 flex flex-col flex-grow">
                  <div className="flex flex-col h-full">
                    {/* Front text always visible */}
                    <div className={isFlipped ? "" : "mb-auto"}>
                      <p className="text-xl md:text-2xl font-medium leading-relaxed text-center whitespace-pre-line">{studyState.card?.front}</p>
                    </div>
                    
                    {/* Back content only visible when flipped */}
                    {isFlipped && (
                      <div className="mt-4">
                        <hr className="mb-4 border-t border-border" />
                        <p className="text-xl md:text-2xl font-medium text-left whitespace-pre-line leading-tight">{studyState.card?.back}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* This empty div provides additional clickable area below the card */}
            <div className="w-full max-w-2xl h-16 mt-4"></div>
          </div>
          
          <div className={`w-full mt-auto pt-8 transition-opacity duration-300 ${
            isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}>
            <div className="grid grid-cols-4 gap-1 sm:gap-2 max-w-2xl w-full mx-auto">
              <div className="flex flex-col items-center">
                <Button 
                  variant="destructive" 
                  size="lg"
                  onClick={() => handleResponse('again')}
                  className="flex items-center gap-1 w-full px-2 sm:px-4"
                >
                  <RotateCcw className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Again</span>
                </Button>
                {studyState.reviewMetrics && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground mt-1">
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
                  className="flex items-center gap-1 w-full px-2 sm:px-4 bg-amber-600 hover:bg-amber-700 text-white border-amber-600 hover:border-amber-700"
                >
                  <X className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Hard</span>
                </Button>
                {studyState.reviewMetrics && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground mt-1">
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
                  className="flex items-center gap-1 w-full px-2 sm:px-4 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                >
                  <Check className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Good</span>
                </Button>
                {studyState.reviewMetrics && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground mt-1">
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
                  className="flex items-center gap-1 w-full px-2 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                >
                  <Star className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Easy</span>
                </Button>
                {studyState.reviewMetrics && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground mt-1">
                      {getTimeUntil(studyState.reviewMetrics.easy)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Card edit modal */}
      <CardEditModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        card={studyState.card ? {
          id: studyState.card.id,
          front: studyState.card.front,
          back: studyState.card.back,
          status: 'active',
          review_at: studyState.card.due,
          deckId: studyState.card.deckId,
          deckName: studyState.deck?.name
        } : null}
        onCardUpdated={handleCardUpdated}
      />
    </div>
  )
} 