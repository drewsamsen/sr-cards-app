"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, RotateCcw, Check, X, ChevronDown, ChevronUp, ChevronRight } from "lucide-react"
import Link from "next/link"
import { deckService, CardReviewResponse, ReviewMetrics, DeckResponse } from "@/lib/api/services/deck.service"
import { cardService, CardLog } from "@/lib/api/services/card.service"

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
  cardLogs: CardLog[];
  isLoading: boolean;
  error: string | null;
  showLogs: boolean;
  message?: string;
}

export default function StudyPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const [isFlipped, setIsFlipped] = useState(false)
  const [studyState, setStudyState] = useState<StudyState>({
    card: null,
    deck: null,
    reviewMetrics: null,
    cardLogs: [],
    isLoading: true,
    error: null,
    showLogs: false
  })

  // Fetch card for review
  const fetchCardForReview = async () => {
    try {
      setStudyState(prev => ({ ...prev, isLoading: true, error: null, cardLogs: [] }))
      const response = await deckService.getCardForReview(params.slug)
      
      if (response.data.status === "success") {
        // Check which scenario we have
        if (response.data.data.card) {
          // Scenario 1: Card available for review
          const newState: StudyState = {
            card: response.data.data.card,
            deck: response.data.data.deck,
            reviewMetrics: response.data.data.reviewMetrics || null,
            cardLogs: [],
            isLoading: false,
            error: null,
            showLogs: false
          }
          
          setStudyState(newState)
          
          // Fetch logs for the card
          fetchCardLogs(response.data.data.card.id)
        } else if (response.data.data.allCaughtUp) {
          // Scenario 2: All caught up - no cards due for review
          setStudyState(prev => ({ 
            ...prev, 
            deck: response.data.data.deck,
            isLoading: false, 
            error: "all_caught_up",
            message: response.data.data.message || "You're all caught up! No cards due for review at this time."
          }))
        } else if (response.data.data.emptyDeck) {
          // Scenario 3: Empty deck - no cards in the deck
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
  }
  
  // Fetch logs for a card
  const fetchCardLogs = async (cardId: string) => {
    try {
      const logsResponse = await cardService.getCardLogs(cardId)
      
      if (logsResponse.data.status === "success") {
        setStudyState(prev => ({
          ...prev,
          cardLogs: logsResponse.data.data.logs
        }))
      }
    } catch (error) {
      console.error("Error fetching card logs:", error)
    }
  }
  
  // Toggle logs visibility
  const toggleLogs = () => {
    setStudyState(prev => ({
      ...prev,
      showLogs: !prev.showLogs
    }))
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
                href={`/deck/${params.slug}`} 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {studyState.deck?.name || params.slug.replace(/-/g, ' ')}
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              <span className="text-foreground font-medium">Study</span>
            </nav>
          </div>
          <div className="flex flex-col items-center justify-center">
            {studyState.error === "empty_deck" ? (
              <>
                <p className="text-xl">{studyState.message || "This deck doesn't have any cards yet. Add some cards to start reviewing!"}</p>
                <Link href={`/deck/${params.slug}`}>
                  <Button className="mt-4">Back to Deck</Button>
                </Link>
              </>
            ) : studyState.error === "all_caught_up" ? (
              <>
                <p className="text-xl">{studyState.message || "You're all caught up! No cards due for review at this time."}</p>
                <Link href={`/deck/${params.slug}`}>
                  <Button className="mt-4">Back to Deck</Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-destructive">Error loading card. Please try again.</p>
                <Button onClick={fetchCardForReview} className="mt-4">Retry</Button>
              </>
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
                href={`/deck/${params.slug}`} 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {studyState.deck?.name || params.slug.replace(/-/g, ' ')}
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              <span className="text-foreground font-medium">Study</span>
            </nav>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-xl">You are all caught up</p>
            <Link href={`/deck/${params.slug}`}>
              <Button className="mt-4">Back to Deck</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Get rating text
  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Again"
      case 2: return "Hard"
      case 3: return "Good"
      case 4: return "Easy"
      default: return "Unknown"
    }
  }

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
              href={`/deck/${params.slug}`} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {studyState.deck?.name || params.slug.replace(/-/g, ' ')}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            <span className="text-foreground font-medium">Study</span>
          </nav>
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
                  <p className="text-lg">{studyState.card?.front}</p>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">Answer</h3>
                  <p className="text-lg">{studyState.card?.back}</p>
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
          
          {/* Card logs section */}
          {studyState.card && studyState.cardLogs.length > 0 && (
            <div className="w-full max-w-2xl mt-8">
              <Button 
                variant="outline" 
                onClick={toggleLogs} 
                className="flex items-center justify-between w-full mb-2"
              >
                <span>Review History</span>
                {studyState.showLogs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              {studyState.showLogs && (
                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Rating</th>
                          <th className="px-4 py-2 text-left">Difficulty</th>
                          <th className="px-4 py-2 text-left">Stability</th>
                          <th className="px-4 py-2 text-left">Next Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studyState.cardLogs.map((log) => (
                          <tr key={log.id} className="border-t">
                            <td className="px-4 py-2">{formatDate(log.review)}</td>
                            <td className="px-4 py-2">{getRatingText(log.rating)}</td>
                            <td className="px-4 py-2">{log.difficulty.toFixed(2)}</td>
                            <td className="px-4 py-2">{log.stability.toFixed(2)}</td>
                            <td className="px-4 py-2">{log.due ? formatDate(log.due) : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 