"use client"

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ImportHistoryItem } from "@/lib/api/services/import.service"

interface ImportHistoryTableProps {
  imports: ImportHistoryItem[];
  isLoading: boolean;
}

export function ImportHistoryTable({ imports, isLoading }: ImportHistoryTableProps) {
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get deck name from deckId (in a real app, you might want to fetch this from a deck service)
  const getDeckName = (deckId: string) => {
    // This is a placeholder. In a real app, you would fetch the deck name from a deck service
    return `Deck ${deckId.substring(0, 8)}...`;
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading import history...</div>;
  }

  if (imports.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No import history found.</div>;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Deck</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total Rows</TableHead>
            <TableHead className="text-right">Valid</TableHead>
            <TableHead className="text-right">Invalid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {imports.map((importItem) => (
            <TableRow key={importItem.id}>
              <TableCell className="font-medium">
                {formatDate(importItem.createdAt)}
              </TableCell>
              <TableCell>{getDeckName(importItem.deckId)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(importItem.status)}>
                  {importItem.status.charAt(0).toUpperCase() + importItem.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{importItem.summary.totalRows}</TableCell>
              <TableCell className="text-right text-green-600 font-medium">
                {importItem.summary.validRows}
              </TableCell>
              <TableCell className="text-right text-red-600 font-medium">
                {importItem.summary.invalidRows}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 