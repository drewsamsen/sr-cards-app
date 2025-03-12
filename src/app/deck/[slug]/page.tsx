"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { deckCardColumns } from "@/components/deck-card-columns"
import { useAuth, useDeck, useDeckCards } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, AlertCircle, BookOpen, Save, Edit, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import React, { use } from "react"
import { deckService, UpdateDeckRequest } from "@/lib/api/services/deck.service"
import { cardService } from "@/lib/api/services/card.service"
import { CardEditModal } from "@/components/card-edit-modal"
import { CardAddModal } from "@/components/card-add-modal"
import { SingleCard } from "@/lib/hooks/useCard"
import { PageLayout } from "@/components/page-layout"

// Define the Card type to match the data structure
export interface DeckCard {
  id: string
  front: string
  back: string
  status: string
  review_at: string | null
  state?: number
  difficulty?: number
  stability?: number
  due?: string | null
  slug?: string
  deckId?: string
  deckName?: string
  onEdit?: (card: DeckCard) => void
}

export default function DeckPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const { slug: deckSlug } = params;
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  
  // Edit form state
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [slug, setSlug] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<boolean>(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  
  // Card edit modal state
  const [isCardEditModalOpen, setIsCardEditModalOpen] = useState<boolean>(false)
  const [selectedCard, setSelectedCard] = useState<SingleCard | null>(null)
  
  // Card add modal state
  const [isCardAddModalOpen, setIsCardAddModalOpen] = useState<boolean>(false)
  
  // Card delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [cardToDelete, setCardToDelete] = useState<DeckCard | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false)
  
  // TODO: In future Next.js versions, params will need to be unwrapped with React.use()
  // before accessing properties. For now, direct access is still supported.
  const { deck, isLoading: isLoadingDeck, error: deckError, refetch: refetchDeck } = useDeck(deckSlug)
  const { 
    cards, 
    isLoading: isLoadingCards, 
    error: cardsError,
    fetchCards,
    searchCards,
    pagination,
    setPage,
    setPageSize
  } = useDeckCards(deck?.id)

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

  // Initialize form with deck data when it loads
  useEffect(() => {
    if (deck) {
      setName(deck.name)
      setDescription(deck.description || "")
      setSlug(deck.slug || "")
    }
  }, [deck])

  // Helper function to generate a slug from a name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')       // Replace spaces with hyphens
      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars except hyphens
      .replace(/\-\-+/g, '-')     // Replace multiple hyphens with single hyphen
      .replace(/^-+/, '')         // Trim hyphens from start
      .replace(/-+$/, '');        // Trim hyphens from end
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(false)
    
    try {
      setIsSubmitting(true)
      
      // Validate form
      if (!name.trim()) {
        setFormError("Deck name is required")
        return
      }
      
      if (!slug.trim()) {
        setFormError("Slug is required")
        return
      }
      
      // Validate slug format (only allow lowercase letters, numbers, and hyphens)
      const slugRegex = /^[a-z0-9-]+$/
      if (!slugRegex.test(slug.trim())) {
        setFormError("Slug can only contain lowercase letters, numbers, and hyphens")
        return
      }
      
      // Update deck data
      const deckData: UpdateDeckRequest = {
        name: name.trim(),
        description: description.trim(),
        slug: slug.trim()
      }
      
      // Submit to API
      const response = await deckService.updateDeck(deck?.id || "", deckData)
      
      if (response.data.status === "success") {
        setFormSuccess(true)
        setIsEditing(false)
        
        // Get the updated deck with the new slug
        const updatedDeck = response.data.data.deck;
        
        // If the slug has changed, redirect to the new URL
        if (updatedDeck.slug !== deckSlug) {
          router.push(`/deck/${updatedDeck.slug}`);
        } else {
          // Otherwise just refetch the current deck data
          refetchDeck();
        }
      } else {
        setFormError("Failed to update deck")
      }
    } catch (err) {
      setFormError("An error occurred while updating the deck")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deck deletion
  const handleDeleteDeck = async () => {
    if (!deck?.id) return;
    
    try {
      setIsDeleting(true);
      const response = await deckService.deleteDeck(deck.id);
      
      if (response.data.status === "success") {
        // Redirect to decks list page after successful deletion
        router.push("/decks");
      } else {
        setFormError("Failed to delete deck");
        setShowDeleteConfirmation(false);
      }
    } catch (err) {
      setFormError("An error occurred while deleting the deck");
      setShowDeleteConfirmation(false);
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle card edit
  const handleCardEdit = (card: DeckCard) => {
    setSelectedCard({
      id: card.id,
      front: card.front,
      back: card.back,
      status: card.status,
      review_at: card.review_at,
      deckId: card.deckId || deck?.id || "",
      deckName: card.deckName || deck?.name,
      deckSlug: deck?.slug
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
        fetchCards()
        
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

  // Add onEdit handler to each card
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
      {deckError && (
        <Alert variant="destructive" className="mb-4 sm:mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {deckError}
          </AlertDescription>
        </Alert>
      )}
      
      {formError && (
        <Alert variant="destructive" className="mb-4 sm:mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {formError}
          </AlertDescription>
        </Alert>
      )}
      
      {formSuccess && (
        <Alert className="mb-4 sm:mb-6 bg-green-50 text-green-800 border-green-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Deck updated successfully!</AlertDescription>
        </Alert>
      )}
      
      {deleteSuccess && (
        <Alert className="mb-4 sm:mb-6 bg-green-50 text-green-800 border-green-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Card deleted successfully!</AlertDescription>
        </Alert>
      )}
      
      {/* Ultra compact deck header */}
      {!isEditing ? (
        <div className="flex items-center mb-2 sm:mb-3 px-4 sm:px-6">
          <h1 className="text-xl font-semibold">
            {isLoadingDeck ? "Loading..." : deck?.name || "Deck not found"}
          </h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="h-7 w-7 p-0 ml-2"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Edit Deck</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Deck Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newName = e.target.value;
                    setName(newName);
                    // Only auto-generate slug if the user hasn't manually edited it
                    // or if it's empty or if it was derived from the previous name
                    if (!slug || slug === generateSlug(name)) {
                      setSlug(generateSlug(newName));
                    }
                  }}
                  placeholder="e.g. JavaScript Basics"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug (URL-friendly identifier)</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
                    placeholder="e.g. javascript-basics"
                    required
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSlug(generateSlug(name))}
                    className="whitespace-nowrap"
                  >
                    Generate from Name
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This will be used in the URL: /deck/<span className="font-mono">{slug || 'your-slug'}</span>
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  placeholder="Describe what this deck is about..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-between gap-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Delete Deck
                </Button>
                
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {cardsError && (
        <Alert variant="destructive" className="mb-4 sm:mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {cardsError}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="pt-2 sm:pt-3 px-2 sm:px-6 pb-4 sm:pb-6">
          <DataTable 
            columns={deckCardColumns} 
            data={cardsWithHandlers} 
            searchPlaceholder="Search cards..." 
            emptyMessage={
              isLoadingCards 
                ? "Loading cards..." 
                : cardsError 
                  ? "Error loading cards" 
                  : "No cards found in this deck."
            }
            pagination={tablePagination}
            onPaginationChange={{
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange
            }}
            onSearch={handleSearch}
            useServerSearch={true}
            actionButton={
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => setIsCardAddModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Card
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  disabled={isLoadingCards || cards.length === 0}
                  onClick={() => router.push(`/deck/${deckSlug}/study`)}
                >
                  <BookOpen className="h-4 w-4" />
                  Study
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
      
      {/* Card Edit Modal */}
      <CardEditModal
        isOpen={isCardEditModalOpen}
        onOpenChange={setIsCardEditModalOpen}
        card={selectedCard}
        onCardUpdated={() => {
          fetchCards()
          setIsCardEditModalOpen(false)
        }}
      />
      
      {/* Card Add Modal */}
      <CardAddModal
        isOpen={isCardAddModalOpen}
        onOpenChange={setIsCardAddModalOpen}
        deckId={deck?.id || ""}
        onCardAdded={() => {
          fetchCards()
          setIsCardAddModalOpen(false)
        }}
      />
      
      {/* Card Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this card?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the card
              from your deck.
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
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Deck Confirmation Modal */}
      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this deck?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deck
              &ldquo;{deck?.name}&rdquo; and all its cards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDeck}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90 hover:text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Deck"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
} 