"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  ImportPreview, 
  ImportRowPreview, 
  importService 
} from "@/lib/api/services/import.service"

interface ImportPreviewModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  importPreview: ImportPreview | null
  previewRows: ImportRowPreview[]
  onConfirmImport: () => void
  onCancel: () => void
  isConfirming: boolean
  confirmError: string | null
  isCancelling: boolean
  cancelError: string | null
}

export function ImportPreviewModal({
  isOpen,
  onOpenChange,
  importPreview,
  previewRows,
  onConfirmImport,
  onCancel,
  isConfirming,
  confirmError,
  isCancelling,
  cancelError
}: ImportPreviewModalProps) {
  if (!importPreview) return null

  const { summary } = importPreview
  const hasErrors = summary.invalidRows > 0

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Preview</DialogTitle>
        </DialogHeader>

        {confirmError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{confirmError}</AlertDescription>
          </Alert>
        )}

        {cancelError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{cancelError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
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
            <Alert variant="destructive" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="mb-2">The following errors were found:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {summary.errors.map((error, index) => (
                    <li key={index}>
                      Row {error.row}: {error.message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Front</TableHead>
                  <TableHead>Back</TableHead>
                  <TableHead className="w-[200px]">Issue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, index) => (
                  <TableRow key={index} className={row.status === 'invalid' ? 'bg-red-50' : ''}>
                    <TableCell>
                      {row.status === 'valid' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {row.front || <span className="text-muted-foreground italic">Empty</span>}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {row.back || <span className="text-muted-foreground italic">Empty</span>}
                    </TableCell>
                    <TableCell className="text-sm text-red-600">
                      {row.error || ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isConfirming || isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Cancel"}
          </Button>
          <Button
            type="button"
            onClick={onConfirmImport}
            disabled={hasErrors || isConfirming || isCancelling}
            className="flex items-center gap-2"
          >
            {isConfirming ? "Processing..." : "Confirm Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 