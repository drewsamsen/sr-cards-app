"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { deckCardColumns, DeckCard } from "@/components/deck-card-columns"
import { useAuth, useCards } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CardAddWithDeckModal } from "@/components/card-add-with-deck-modal"
import { PageLayout } from "@/components/page-layout"
import { CardEditModal } from "@/components/card-edit-modal"
import { SingleCard } from "@/lib/hooks/useCard"
import { cardService } from "@/lib/api/services/card.service"
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

export default function CardsPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const { 
    cards, 
    isLoading: isLoadingCards, 
    error: cardsError,
    pagination,
    setPage,
    setPageSize,
    searchCards,
    refreshCards
  } = useCards()
  
  // State for the add card modal
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
  
  // State for the edit card modal
  const [isCardEditModalOpen, setIsCardEditModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<SingleCard | null>(null)
  
  // State for card delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<DeckCard | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  // Calculate pagination values for the DataTable
  const tablePagination = {
    pageIndex: Math.floor(pagination.offset / pagination.limit),
    pageSize: pagination.limit,
    pageCount: Math.ceil(pagination.total / pagination.limit),
    totalItems: pagination.total
  }

  // Pagination change handlers
  const handlePageChange = (page: number) => {
    setPage(page);
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  }

  // Search handler
  const handleSearch = (query: string) => {
    searchCards(query);
  }
  
  // Handle card added
  const handleCardAdded = () => {
    refreshCards()
  }
  
  // Handle card edit
  const handleCardEdit = (card: DeckCard) => {
    setSelectedCard({
      id: card.id,
      front: card.front,
      back: card.back,
      status: card.status,
      review_at: card.review_at,
      deckId: card.deckId || "",
      deckName: card.deckName
    })
    setIsCardEditModalOpen(true)
  }
  
  // Handle card delete
  const handleCardDelete = (card: DeckCard) => {
    setCardToDelete(card)
    setIsDeleteDialogOpen(true)
  }
  
  // Confirm card delete
  const confirmCardDelete = async () => {
    if (!cardToDelete) return
    
    setDeleteError(null)
    setIsDeleting(true)
    
    try {
      const response = await cardService.deleteCard(cardToDelete.id)
      
      if (response.status === 200 && response.data.status === "success") {
        setDeleteSuccess(true)
        setIsDeleteDialogOpen(false)
        
        // Refresh the cards list
        refreshCards()
        
        // Show success message briefly
        setTimeout(() => {
          setDeleteSuccess(false)
        }, 3000)
      } else {
        setDeleteError("Failed to delete card")
      }
    } catch (err) {
      setDeleteError("An error occurred while deleting the card")
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  // Add onEdit and onDelete handlers to each card
  const cardsWithHandlers = cards.map(card => ({
    ...card,
    onEdit: handleCardEdit,
    onDelete: handleCardDelete
  }))

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

  return (
    <PageLayout>
      {cardsError && (
        <Alert variant="destructive" className="mb-2 sm:mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {cardsError}
          </AlertDescription>
        </Alert>
      )}
      
      {deleteSuccess && (
        <Alert className="mb-2 sm:mb-3 bg-green-50 text-green-800 border-green-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Card deleted successfully!</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Cards</CardTitle>
          <Button 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setIsAddCardModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create new card
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={deckCardColumns} 
            data={cardsWithHandlers} 
            searchPlaceholder="Search across all cards..." 
            emptyMessage={isLoadingCards ? "Loading cards..." : "No flashcards found."}
            pagination={tablePagination}
            onPaginationChange={{
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange
            }}
            onSearch={handleSearch}
            useServerSearch={true}
          />
        </CardContent>
      </Card>
      
      <CardAddWithDeckModal
        isOpen={isAddCardModalOpen}
        onOpenChange={setIsAddCardModalOpen}
        onCardAdded={handleCardAdded}
      />
      
      {/* Card Edit Modal */}
      <CardEditModal
        isOpen={isCardEditModalOpen}
        onOpenChange={setIsCardEditModalOpen}
        card={selectedCard}
        onCardUpdated={() => {
          refreshCards()
          setIsCardEditModalOpen(false)
        }}
      />
      
      {/* Card Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this card?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the card.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {deleteError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCardDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
} 