"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth, useDecks } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Upload, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { ImportPreviewModal } from "@/components/import-preview-modal"
import { ImportResultsModal } from "@/components/import-results-modal"
import { ImportHistoryTable } from "@/components/import-history-table"
import { 
  importService, 
  ImportPreview, 
  ImportRowPreview,
  ConfirmImportResponse,
  ImportHistoryItem
} from "@/lib/api/services/import.service"

export default function ImportPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const { decks, isLoading: isLoadingDecks } = useDecks()
  
  // Form state
  const [tabContent, setTabContent] = useState<string>("")
  const [selectedDeckId, setSelectedDeckId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  
  // Preview state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [previewRows, setPreviewRows] = useState<ImportRowPreview[]>([])
  
  // Execute state
  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<boolean>(false)
  
  // Cancel state
  const [isCancelling, setIsCancelling] = useState<boolean>(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [cancelSuccess, setCancelSuccess] = useState<boolean>(false)
  
  // Results state
  const [isResultsModalOpen, setIsResultsModalOpen] = useState<boolean>(false)
  const [importResults, setImportResults] = useState<ConfirmImportResponse['data'] | null>(null)
  
  // Import history state
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  // Redirect to login page if not logged in
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login')
    }
  }, [user, router, isInitialized])

  // Set the first deck as selected when decks load
  useEffect(() => {
    if (decks.length > 0 && !selectedDeckId) {
      setSelectedDeckId(decks[0].id)
    }
  }, [decks, selectedDeckId])

  // Fetch import history when the component mounts
  useEffect(() => {
    if (isInitialized && user) {
      fetchImportHistory()
    }
  }, [isInitialized, user])

  // Fetch import history
  const fetchImportHistory = async () => {
    setIsLoadingHistory(true)
    setHistoryError(null)

    try {
      const response = await importService.getImportHistory()
      
      if (response.data.status === "success") {
        setImportHistory(response.data.data.imports)
      } else {
        setHistoryError("Failed to fetch import history")
      }
    } catch (err) {
      setHistoryError("An error occurred while fetching import history")
      console.error(err)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Handle form submission to create preview
  const handleCreatePreview = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    setImportSuccess(false)

    try {
      // Call the API to create an import preview
      const response = await importService.createImportPreview({
        deckId: selectedDeckId,
        csvData: tabContent
      })
      
      if (response.data.status === "success") {
        // Store the preview data
        setImportPreview(response.data.data.import)
        setPreviewRows(response.data.data.preview)
        
        // Open the preview modal
        setIsPreviewModalOpen(true)
      } else {
        setError("Failed to create import preview")
      }
    } catch (err) {
      setError("An error occurred while creating the import preview")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle confirming the import
  const handleConfirmImport = async () => {
    if (!importPreview) return
    
    setConfirmError(null)
    setIsConfirming(true)
    
    try {
      // Call the API to confirm the import
      const response = await importService.confirmImport({
        importId: importPreview.id
      })
      
      if (response.data.status === "success") {
        // Close the preview modal
        setIsPreviewModalOpen(false)
        
        // Store the results and open the results modal
        setImportResults(response.data.data)
        setIsResultsModalOpen(true)
        
        // Reset the form if there were no errors
        if (response.data.data.status === "completed") {
          setTabContent("")
          setImportSuccess(true)
        }
        
        // Reset the preview data
        setImportPreview(null)
        setPreviewRows([])
        
        // Refresh import history after successful import
        fetchImportHistory()
      } else {
        setConfirmError("Failed to confirm import")
      }
    } catch (err) {
      setConfirmError("An error occurred while confirming the import")
      console.error(err)
    } finally {
      setIsConfirming(false)
    }
  }

  // Handle canceling the import
  const handleCancelImport = async () => {
    if (!importPreview) return
    
    setCancelError(null)
    setIsCancelling(true)
    
    try {
      // Call the API to cancel the import
      const response = await importService.cancelImport({
        importId: importPreview.id
      })
      
      if (response.data.status === "success") {
        // Close the preview modal
        setIsPreviewModalOpen(false)
        
        // Show success message
        setCancelSuccess(true)
        
        // Reset the preview data
        setImportPreview(null)
        setPreviewRows([])
        
        // Show a temporary success message
        setTimeout(() => {
          setCancelSuccess(false)
        }, 5000)
      } else {
        setCancelError("Failed to cancel import")
      }
    } catch (err) {
      setCancelError("An error occurred while canceling the import")
      console.error(err)
    } finally {
      setIsCancelling(false)
    }
  }

  // Handle closing the results modal
  const handleCloseResults = () => {
    setIsResultsModalOpen(false)
  }

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
          <h1 className="text-2xl font-bold tracking-tight">Import Flashcards</h1>
          <p className="text-muted-foreground">Import flashcards from comma-delimited or tab-delimited format.</p>
        </div>
        <div className="mt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {importSuccess && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Import successfully executed!</AlertDescription>
            </Alert>
          )}
          
          {cancelSuccess && (
            <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Import cancelled successfully.</AlertDescription>
            </Alert>
          )}
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Import Options</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePreview} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deck-select">Select Deck</Label>
                  <Select 
                    value={selectedDeckId} 
                    onValueChange={setSelectedDeckId}
                    disabled={isLoadingDecks || decks.length === 0}
                  >
                    <SelectTrigger id="deck-select" className="w-full">
                      <SelectValue placeholder="Select a deck" />
                    </SelectTrigger>
                    <SelectContent>
                      {decks.map((deck) => (
                        <SelectItem key={deck.id} value={deck.id}>
                          {deck.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {decks.length === 0 && !isLoadingDecks && (
                    <p className="text-sm text-destructive">
                      You don't have any decks. Please create a deck first.
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tab-content">Delimited Content</Label>
                  <Textarea
                    id="tab-content"
                    placeholder="front,back
What is React?,A JavaScript library for building user interfaces
What is NextJS?,A React framework for production

OR use tabs:
front	back
What is React?	A JavaScript library for building user interfaces
What is NextJS?	A React framework for production"
                    rows={10}
                    value={tabContent}
                    onChange={(e) => setTabContent(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    Format: front,back or front[tab]back (one card per line)
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="flex items-center gap-2"
                    disabled={
                      isSubmitting || 
                      !tabContent.trim() || 
                      !selectedDeckId || 
                      isLoadingDecks
                    }
                  >
                    <Upload className="h-4 w-4" />
                    {isSubmitting ? "Validating..." : "Validate & Preview"}
                  </Button>
                </div>
              </form>
              
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium mb-2">Import Instructions</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Use comma-delimited values (CSV) or tab-delimited values (TSV) with headers</li>
                  <li>Each line after the header represents one flashcard</li>
                  <li>All cards will be imported into the selected deck</li>
                  <li>The import process has two steps: validation and confirmation</li>
                  <li>You'll see a preview of the import before confirming</li>
                </ul>
                
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Need help? Check out our <a href="#" className="text-primary hover:underline">documentation</a> for more details.</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Import History</h2>
            
            {historyError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{historyError}</AlertDescription>
              </Alert>
            )}
            
            <ImportHistoryTable 
              imports={importHistory} 
              isLoading={isLoadingHistory} 
            />
            
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchImportHistory}
                disabled={isLoadingHistory}
              >
                {isLoadingHistory ? "Refreshing..." : "Refresh History"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Import Preview Modal */}
      <ImportPreviewModal
        isOpen={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
        importPreview={importPreview}
        previewRows={previewRows}
        onConfirmImport={handleConfirmImport}
        onCancel={handleCancelImport}
        isConfirming={isConfirming}
        confirmError={confirmError}
        isCancelling={isCancelling}
        cancelError={cancelError}
      />
      
      {/* Import Results Modal */}
      <ImportResultsModal
        isOpen={isResultsModalOpen}
        onOpenChange={setIsResultsModalOpen}
        importResults={importResults}
        onClose={handleCloseResults}
      />
    </div>
  )
} 