"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { deckCardColumns, DeckCard } from "@/components/deck-card-columns"
import { useAuth, useCards } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CardAddWithDeckModal } from "@/components/card-add-with-deck-modal"
import { PageLayout } from "@/components/page-layout"
import { CardEditModal } from "@/components/card-edit-modal"
import { SingleCard } from "@/lib/hooks/useCard"
import { cardService } from "@/lib/api/services/card.service"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
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

// Create a CardsTableSkeleton component for loading state
function CardsTableSkeleton() {
  // Display 7 skeleton rows
  const skeletonRows = Array(7).fill(0)
  
  return (
    <div className="w-full">
      {/* Search and header section skeleton */}
      <div className="flex items-center justify-between py-4">
        <Skeleton className="h-9 w-[250px]" />
        <Skeleton className="h-9 w-[120px] rounded-md" />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead style={{ width: "100px" }}>
                <Skeleton className="h-8 w-16" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="max-w-[200px]">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Footer/pagination skeleton */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <Skeleton className="h-9 w-[250px]" />
        <Skeleton className="h-9 w-[150px]" />
      </div>
    </div>
  )
}

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
        setIsDeleteDialogOpen(false)
        
        // Refresh the cards list
        refreshCards()
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
        <Alert variant="destructive" className="mb-4 sm:mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {cardsError}
          </AlertDescription>
        </Alert>
      )}
      
      {isLoadingCards ? (
        <CardsTableSkeleton />
      ) : (
        <DataTable 
          columns={deckCardColumns} 
          data={cards.map(card => ({
            ...card,
            onEdit: handleCardEdit,
            onDelete: handleCardDelete
          }))} 
          searchPlaceholder="Search cards..." 
          emptyMessage="No cards found."
          pagination={tablePagination}
          onPaginationChange={{
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange
          }}
          onSearch={handleSearch}
          useServerSearch={true}
          actionButton={
            <Button 
              onClick={() => setIsAddCardModalOpen(true)}
              className="flex items-center gap-1"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Card
            </Button>
          }
        />
      )}
      
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