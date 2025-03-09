"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Define the type for our data
export type DeckCard = {
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
  onDelete?: (card: DeckCard) => void
}

// Helper function to format dates
/* Commented out as it's not currently used
const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not scheduled";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 0) return "Overdue";
  if (diffMinutes < 60) return `${diffMinutes} min`;
  if (diffHours < 24) return `${diffHours} hr`;
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} wk`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mo`;
  
  return `${Math.floor(diffDays / 365)} yr`;
};
*/

// Helper function to format numbers with 2 decimal places
/* Commented out as it's not currently used
const formatNumber = (num: number | undefined) => {
  if (num === undefined) return "N/A";
  return num.toFixed(2);
};
*/

// Helper function to get state label
const getStateLabel = (state: number | undefined) => {
  if (state === undefined) return "Unknown";
  switch (state) {
    case 0: return "New";
    case 1: return "Learning";
    case 2: return "Review";
    case 3: return "Relearning";
    default: return `State ${state}`;
  }
};

// Helper function to get state color
const getStateColor = (state: number | undefined) => {
  if (state === undefined) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  switch (state) {
    case 0: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case 1: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case 2: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case 3: return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

// Define the columns for our table
export const deckCardColumns: ColumnDef<DeckCard>[] = [
  {
    accessorKey: "front",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Card Content
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const front = row.getValue("front") as string
      const back = row.original.back
      const state = row.original.state
      
      return (
        <div className="space-y-1.5">
          <div className="text-sm font-bold">{front}</div>
          <div className="text-sm text-muted-foreground">
            {back}
          </div>
          <div>
            <Badge className={`text-xs ${getStateColor(state)}`}>
              {getStateLabel(state)}
            </Badge>
          </div>
        </div>
      )
    },
  },
  {
    id: "edit",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-center gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => row.original.onEdit?.(row.original)}
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => row.original.onDelete?.(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
    size: 150,
  },
] 