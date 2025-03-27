"use client"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw, Check, X, Edit, Star, Lightbulb } from "lucide-react"
import Link from "next/link"
import { deckService, CardReviewResponse, DeckResponse, DailyProgress } from "@/lib/api/services/deck.service"
import { cardService } from "@/lib/api/services/card.service"
import { CardEditModal } from "@/components/card-edit-modal"
import { CardAIExplanationModal } from "@/components/card-ai-explanation-modal"
import { PageLayout } from "@/components/page-layout"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

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
  isComplete: boolean
}

export default function StudyPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const { slug } = params;
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const [isFlipped, setIsFlipped] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [studyState, setStudyState] = useState<StudyState>({
    currentCard: null,
    cardQueue: [],
    deck: null,
    isLoading: true,
    error: null,
    allCaughtUp: false,
    emptyDeck: false,
    processedCardIds: new Set<string>(),
    isComplete: false
  })
  
  // Card edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // AI explanation modal state
  const [isAIExplanationModalOpen, setIsAIExplanationModalOpen] = useState(false)
  const [aiExplanation, setAIExplanation] = useState("")
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false)

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
  }, [fetchCardsForReview]);

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

  const handleAIHelpClick = async (e: React.MouseEvent) => {
    // Prevent the card from flipping when clicking the AI help button
    e.stopPropagation()
    
    if (!studyState.currentCard) return
    
    setIsAIExplanationModalOpen(true)
    setIsLoadingExplanation(true)
    setAIExplanation("")
    
    try {
      const response = await cardService.expoundCard(studyState.currentCard.id)
      
      if (response.data.status === "success") {
        setAIExplanation(response.data.data.explanation)
      } else {
        setAIExplanation("Sorry, we couldn't generate an explanation for this card at the moment.")
      }
    } catch (error) {
      console.error("Error fetching AI explanation:", error)
      setAIExplanation("Sorry, we couldn't generate an explanation for this card at the moment.")
    } finally {
      setIsLoadingExplanation(false)
    }
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

  // Handler for when a card is deleted
  const handleCardDeleted = () => {
    // Move to the next card
    getNextCard()
    // Reset the flipped state
    setIsFlipped(false)
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
    const currentCardId = studyState.currentCard.id
    
    // Log the due date based on the response
    if (studyState.currentCard.reviewMetrics) {
      const dueDate = studyState.currentCard.reviewMetrics[response]
      console.log(`Next review due: ${dueDate}`)
    }
    
    // Immediately flip back to the front and get the next card
    setIsFlipped(false)
    getNextCard()
    
    // Start transition animation for the buttons
    setIsTransitioning(true)
    
    // Submit the review to the API in the background
    cardService.reviewCard(currentCardId, { rating })
      .catch(error => {
        console.error("Error submitting card review:", error)
      })
      .finally(() => {
        // Reset transitioning state after a short delay to allow animations to complete
        setTimeout(() => {
          setIsTransitioning(false)
        }, 300)
      })
  }

  // Show loading state while fetching card
  if (studyState.isLoading) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
          <div className="w-full">
            {/* Card skeleton */}
            <Card className="w-full min-h-[16rem] md:min-h-[20rem] mb-6">
              <CardContent className="flex flex-col items-center justify-center h-full p-6">
                {/* Title/question skeleton */}
                <Skeleton className="h-8 w-3/4 mb-4" />
                {/* Content skeleton lines */}
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Show error state if there was an error
  if (studyState.error) {
    return (
      <PageLayout>
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
                    <Link href="/decks" className="w-full">
                      <Button className="w-full py-6 text-lg">Back to Decks</Button>
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
                      <Button variant="outline" className="w-full">Back to Decks</Button>
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
                    <Link href="/decks" className="w-full">
                      <Button variant="outline" className="w-full">Back to Decks</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    )
  }

  // Show completion state if study session is complete
  if (studyState.isComplete) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center">
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
                <Link href="/decks" className="w-full">
                  <Button className="w-full py-6 text-lg">Back to Decks</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Show message if no cards to review
  if (!studyState.currentCard) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
          <div className="flex flex-col items-center justify-center">
            <p className="text-xl">You are all caught up</p>
            <Link href="/decks">
              <Button className="mt-4">Back to Decks</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-between h-full">
        {/* Make this entire area clickable for flipping the card */}
        <div className="w-full flex-1 flex flex-col items-center cursor-pointer" onClick={handleFlip}>
          <div className="w-full flex justify-center h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={studyState.currentCard?.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <Card 
                  className="w-full max-w-2xl min-h-[16rem] md:min-h-[20rem] cursor-pointer transition-all duration-300 relative flex flex-col"
                  onClick={handleFlip}
                >
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                      onClick={handleAIHelpClick}
                      title="Get AI explanation"
                    >
                      <Lightbulb className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card flip when clicking edit
                        handleEditClick(e);
                      }}
                      title="Edit card"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <CardContent className="p-6 flex flex-col flex-grow">
                    {/* Front content - always visible */}
                    <div className="flex flex-col h-full">
                      <div className="mb-auto">
                        <p className="text-xl md:text-2xl font-medium leading-relaxed text-center whitespace-pre-line">{studyState.currentCard?.front}</p>
                      </div>
                      
                      {/* Back content - only visible when flipped */}
                      <AnimatePresence>
                        {isFlipped && (
                          <motion.div
                            key="answer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4"
                          >
                            <hr className="mb-4 border-t border-border dark:border-gray-600" />
                            <p className="text-xl md:text-2xl font-medium text-left whitespace-pre-line leading-tight">{studyState.currentCard?.back}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* This empty div provides additional clickable area below the card */}
          <div className="w-full max-w-2xl h-16 mt-4"></div>
        </div>
        
        <motion.div 
          className="w-full mt-auto bg-background pb-4 pt-4 px-2 md:pb-0 md:pt-8 md:px-0 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:shadow-none z-10"
          initial={{ y: 100, opacity: 0 }}
          animate={{ 
            y: isFlipped ? 0 : 100, 
            opacity: isFlipped ? 1 : 0,
            transition: { 
              y: { duration: 0.3, type: "spring", stiffness: 500, damping: 30 },
              opacity: { duration: 0.2 }
            }
          }}
        >
          <div className="grid grid-cols-4 gap-0.5 xs:gap-1 sm:gap-2 max-w-2xl w-full mx-auto">
            <div className="flex flex-col items-center">
              <Button 
                variant="destructive" 
                size="lg"
                onClick={() => handleResponse('again')}
                className="flex items-center justify-center h-14 xs:h-16 w-full px-0.5 xs:px-1 sm:px-4 text-xs xs:text-sm sm:text-base bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
                disabled={isTransitioning}
              >
                <RotateCcw className="h-3 w-3 xs:h-4 xs:w-4 flex-shrink-0 mr-0.5 xs:mr-1" />
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
                className="flex items-center justify-center h-14 xs:h-16 w-full px-0.5 xs:px-1 sm:px-4 text-xs xs:text-sm sm:text-base text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-900 dark:hover:bg-orange-800 border-0"
                disabled={isTransitioning}
              >
                <X className="h-3 w-3 xs:h-4 xs:w-4 flex-shrink-0 mr-0.5 xs:mr-1" />
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
                variant="secondary" 
                size="lg"
                onClick={() => handleResponse('good')}
                className="flex items-center justify-center h-14 xs:h-16 w-full px-0.5 xs:px-1 sm:px-4 text-xs xs:text-sm sm:text-base text-white bg-green-600 hover:bg-green-700 dark:bg-green-900 dark:hover:bg-green-800"
                disabled={isTransitioning}
              >
                <Check className="h-3 w-3 xs:h-4 xs:w-4 flex-shrink-0 mr-0.5 xs:mr-1" />
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
                variant="default" 
                size="lg"
                onClick={() => handleResponse('easy')}
                className="flex items-center justify-center h-14 xs:h-16 w-full px-0.5 xs:px-1 sm:px-4 text-xs xs:text-sm sm:text-base text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800"
                disabled={isTransitioning}
              >
                <Check className="h-4 w-4 xs:h-5 xs:w-5 flex-shrink-0 mr-0.5 xs:mr-1" />
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
        </motion.div>
      </div>
      
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
        onCardDeleted={handleCardDeleted}
      />
      
      {/* AI explanation modal */}
      {studyState.currentCard && (
        <CardAIExplanationModal
          explanation={aiExplanation}
          isOpen={isAIExplanationModalOpen}
          onOpenChange={setIsAIExplanationModalOpen}
          isLoading={isLoadingExplanation}
        />
      )}
      
      <style jsx global>{`
        /* Removed perspective and backface-hidden styles */
      `}</style>
    </PageLayout>
  )
} 