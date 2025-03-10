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
  currentCard: CardReviewResponse | null
  cardQueue: CardReviewResponse[]
  deck: DeckResponse | null
  isLoading: boolean
  error: string | null
  message?: string
  dailyProgress?: DailyProgress
  allCaughtUp: boolean
  emptyDeck: boolean
  processedCardIds: Set<string> // Track cards we've already seen
}

export default function StudyPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const { slug } = params;
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const [isFlipped, setIsFlipped] = useState(false)
  const [studyState, setStudyState] = useState<StudyState>({
    currentCard: null,
    cardQueue: [],
    deck: null,
    isLoading: true,
    error: null,
    allCaughtUp: false,
    emptyDeck: false,
    processedCardIds: new Set<string>()
  })
  
  // Card edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Function to get the next card from the queue
  const getNextCard = useCallback(() => {
    setStudyState(prev => {
      // If there are cards in the queue, get the next one
      if (prev.cardQueue.length > 0) {
        const [nextCard, ...remainingCards] = prev.cardQueue;
        
        // If we're down to the last 2 cards, check for new cards
        if (remainingCards.length <= 1 && !prev.allCaughtUp && !prev.emptyDeck) {
          // Fetch more cards in the background
          fetchCardsForReview(false);
        }
        
        return {
          ...prev,
          currentCard: nextCard,
          cardQueue: remainingCards,
          isLoading: false,
          error: null
        };
      } else if (prev.allCaughtUp) {
        // No more cards and we're all caught up
        return {
          ...prev,
          currentCard: null,
          isLoading: false,
          error: "all_caught_up"
        };
      } else if (prev.emptyDeck) {
        // No cards in the deck
        return {
          ...prev,
          currentCard: null,
          isLoading: false,
          error: "empty_deck"
        };
      } else {
        // No cards in queue but not explicitly caught up - try fetching more
        fetchCardsForReview(true);
        return {
          ...prev,
          isLoading: true
        };
      }
    });
  }, []);

  // Fetch cards for review
  const fetchCardsForReview = useCallback(async (updateCurrentCard: boolean = true) => {
    try {
      if (updateCurrentCard) {
        setStudyState(prev => ({ ...prev, isLoading: true, error: null }));
      }
      
      const response = await deckService.getCardForReview(slug);
      
      if (response.data.status === "success") {
        const { deck, cards, allCaughtUp, emptyDeck, message, dailyProgress } = response.data.data;
        
        // Update the study state based on the response
        setStudyState(prev => {
          // If we have cards in the response
          if (cards && cards.length > 0) {
            // Filter out cards we've already processed
            const newCards = cards.filter(card => !prev.processedCardIds.has(card.id));
            
            // If no new cards and we're not updating the current card, we're caught up
            if (newCards.length === 0 && !updateCurrentCard) {
              return {
                ...prev,
                deck,
                dailyProgress,
                allCaughtUp: true
              };
            }
            
            // Add new card IDs to the processed set
            const updatedProcessedIds = new Set(prev.processedCardIds);
            newCards.forEach(card => updatedProcessedIds.add(card.id));
            
            // If we're updating the current card (initial load or empty queue)
            if (updateCurrentCard) {
              const [currentCard, ...queueCards] = newCards;
              return {
                ...prev,
                currentCard,
                cardQueue: [...queueCards, ...prev.cardQueue],
                deck,
                isLoading: false,
                error: null,
                dailyProgress,
                allCaughtUp: false,
                emptyDeck: false,
                processedCardIds: updatedProcessedIds
              };
            } else {
              // Just adding to the queue
              return {
                ...prev,
                cardQueue: [...prev.cardQueue, ...newCards],
                deck,
                dailyProgress,
                allCaughtUp: newCards.length < cards.length, // If we filtered some cards, we might be caught up
                emptyDeck: false,
                processedCardIds: updatedProcessedIds
              };
            }
          } else if (allCaughtUp) {
            // All caught up - no more cards to review
            return {
              ...prev,
              deck,
              isLoading: false,
              error: updateCurrentCard ? "all_caught_up" : prev.error,
              message: message || "You're all caught up! No cards due for review at this time.",
              dailyProgress,
              allCaughtUp: true,
              emptyDeck: false
            };
          } else if (emptyDeck) {
            // Empty deck - no cards in the deck
            return {
              ...prev,
              deck,
              isLoading: false,
              error: updateCurrentCard ? "empty_deck" : prev.error,
              message: message || "This deck doesn't have any cards yet. Add some cards to start reviewing!",
              dailyProgress,
              allCaughtUp: false,
              emptyDeck: true
            };
          } else {
            // Fallback for unexpected response format
            return {
              ...prev,
              deck,
              isLoading: false,
              error: updateCurrentCard ? "Failed to load cards" : prev.error,
              dailyProgress
            };
          }
        });
      } else {
        // Error response
        if (updateCurrentCard) {
          setStudyState(prev => ({
            ...prev,
            isLoading: false,
            error: "Failed to load cards"
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching cards for review:", error);
      if (updateCurrentCard) {
        setStudyState(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to load cards"
        }));
      }
    }
  }, [slug]);
  
  // Redirect to login page if not logged in
  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    
    if (!user) {
      router.push('/login');
    } else if (isInitialized && user) {
      fetchCardsForReview(true);
    }
  }, [user, router, isInitialized, slug, fetchCardsForReview]);

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
    if (studyState.currentCard) {
      try {
        const response = await cardService.getCard(studyState.currentCard.id)
        if (response.data.status === "success") {
          // Update the card in the study state
          setStudyState(prev => ({
            ...prev,
            currentCard: {
              ...prev.currentCard!,
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
    if (!studyState.currentCard) return
    
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
      if (studyState.currentCard.reviewMetrics) {
        const dueDate = studyState.currentCard.reviewMetrics[response]
        console.log(`Next review due: ${dueDate}`)
      }
      
      // Submit the review to the API
      await cardService.reviewCard(studyState.currentCard.id, { rating })
      
      // Flip back to the front and get the next card
      setIsFlipped(false)
      getNextCard()
    } catch (error) {
      console.error("Error submitting card review:", error)
      // Still get the next card even if there was an error
      setIsFlipped(false)
      getNextCard()
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
                        onClick={() => fetchCardsForReview()}
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
  if (!studyState.currentCard) {
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
          <div className="w-full flex-grow flex flex-col items-center cursor-pointer pb-32 md:pb-0" onClick={handleFlip}>
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
                      <p className="text-xl md:text-2xl font-medium leading-relaxed text-center whitespace-pre-line">{studyState.currentCard?.front}</p>
                    </div>
                    
                    {/* Back content only visible when flipped */}
                    {isFlipped && (
                      <div className="mt-4">
                        <hr className="mb-4 border-t border-border" />
                        <p className="text-xl md:text-2xl font-medium text-left whitespace-pre-line leading-tight">{studyState.currentCard?.back}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* This empty div provides additional clickable area below the card */}
            <div className="w-full max-w-2xl h-16 mt-4"></div>
          </div>
          
          <div className={`w-full fixed bottom-0 left-0 right-0 bg-background pb-4 pt-4 px-4 md:static md:pb-0 md:pt-8 md:px-0 transition-opacity duration-300 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:shadow-none ${
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
                {studyState.currentCard?.reviewMetrics && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground mt-1">
                      {getTimeUntil(studyState.currentCard.reviewMetrics.again)}
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
                {studyState.currentCard?.reviewMetrics && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground mt-1">
                      {getTimeUntil(studyState.currentCard.reviewMetrics.hard)}
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
                {studyState.currentCard?.reviewMetrics && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground mt-1">
                      {getTimeUntil(studyState.currentCard.reviewMetrics.good)}
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
                {studyState.currentCard?.reviewMetrics && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground mt-1">
                      {getTimeUntil(studyState.currentCard.reviewMetrics.easy)}
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
        card={studyState.currentCard ? {
          id: studyState.currentCard.id,
          front: studyState.currentCard.front,
          back: studyState.currentCard.back,
          status: 'active',
          review_at: studyState.currentCard.due,
          deckId: studyState.currentCard.deckId,
          deckName: studyState.deck?.name
        } : null}
        onCardUpdated={handleCardUpdated}
      />
    </div>
  )
} 