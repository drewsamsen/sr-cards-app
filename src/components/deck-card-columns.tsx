"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Define the type for our data
export type DeckCard = {
  id: string
  front: string
  back: string
  status: string
  review_at: string | null
  slug?: string
  deckId?: string
  deckName?: string
}

// Helper function to format dates
const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not scheduled";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  
  return date.toLocaleDateString();
};

// Define the columns for our table
export const deckCardColumns: ColumnDef<DeckCard>[] = [
  {
    accessorKey: "front",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Front
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const front = row.getValue("front") as string
      return row.original.slug ? (
        <Link href={`/card/${row.original.slug}`} className="font-medium text-primary hover:underline">
          {front}
        </Link>
      ) : (
        <span className="font-medium">{front}</span>
      )
    },
  },
  {
    accessorKey: "deckId",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Deck
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      // Only show this column if we have a deckId (in the all cards view)
      if (!row.original.deckId) return null;
      
      return (
        <Link 
          href={`/deck/${row.original.deckId}`} 
          className="font-medium text-primary hover:underline"
        >
          {row.original.deckName || `Deck ${row.original.deckId.substring(0, 8)}`}
        </Link>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const getStatusColor = (status: string) => {
        switch (status) {
          case "new": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
          case "learning": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
          case "review": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
          default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
      };
      
      return (
        <Badge className={`${getStatusColor(status)} capitalize`}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "review_at",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Review Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const reviewAt = row.getValue("review_at") as string | null
      return <div className="font-medium">{formatDate(reviewAt)}</div>
    },
  },
  {
    id: "edit",
    header: "Edit",
    cell: ({ row }) => (
      <Link 
        href={`/card/${row.original.id}/edit`} 
        className="text-primary hover:underline"
      >
        Edit
      </Link>
    ),
  },
] 