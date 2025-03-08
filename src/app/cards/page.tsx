"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { deckCardColumns } from "@/components/deck-card-columns"
import { Header } from "@/components/header"
import { useAuth, useCards } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CardAddWithDeckModal } from "@/components/card-add-with-deck-modal"

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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Your Flashcards</h1>
          <p className="text-muted-foreground">Browse and manage your flashcards across all decks.</p>
        </div>
        <div className="mt-6">
          {cardsError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {cardsError}
              </AlertDescription>
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
                data={cards} 
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
        </div>
      </main>
      
      {/* Add Card Modal */}
      <CardAddWithDeckModal
        isOpen={isAddCardModalOpen}
        onOpenChange={setIsAddCardModalOpen}
        onCardAdded={handleCardAdded}
      />
    </div>
  )
} 