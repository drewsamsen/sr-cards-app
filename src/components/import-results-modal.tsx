"use client"

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { ConfirmImportResponse } from "@/lib/api/services/import.service"

interface ImportResultsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  importResults: ConfirmImportResponse['data'] | null
  onClose: () => void
}

export function ImportResultsModal({
  isOpen,
  onOpenChange,
  importResults,
  onClose
}: ImportResultsModalProps) {
  if (!importResults) return null

  const { summary, status } = importResults
  const isSuccess = status === 'completed'
  const hasErrors = summary.invalidRows > 0

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isSuccess ? "Import Completed" : "Import Completed with Errors"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isSuccess ? (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Import completed successfully! All cards have been added to your deck.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Import completed with errors. Some cards could not be imported.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-4 rounded-md">
            <h3 className="text-sm font-medium mb-2">Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Rows</p>
                <p className="font-medium">{summary.totalRows}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valid Rows</p>
                <p className="font-medium text-green-600">{summary.validRows}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Invalid Rows</p>
                <p className={`font-medium ${hasErrors ? 'text-red-600' : 'text-gray-600'}`}>
                  {summary.invalidRows}
                </p>
              </div>
            </div>
          </div>

          {hasErrors && summary.errors && (
            <div>
              <h3 className="text-sm font-medium mb-2">Errors</h3>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Row</TableHead>
                      <TableHead>Error Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.errors.map((error, index) => (
                      <TableRow key={index} className="bg-red-50">
                        <TableCell className="font-medium">{error.row}</TableCell>
                        <TableCell>{error.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 