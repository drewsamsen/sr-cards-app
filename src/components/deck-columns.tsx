"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Define the type for our data
export type Deck = {
  id: string
  name: string
  slug: string
  remainingReviews: number
  totalCards: number
  newCards: number
  dueCards: number
}

// Define the columns for our table
export const deckColumns: ColumnDef<Deck>[] = [
  {
    accessorKey: "remainingReviews",
    header: () => <div className="sr-only">Due for Review</div>,
    cell: ({ row }) => {
      const remainingReviews = row.getValue("remainingReviews") as number
      const slug = row.original.slug
      
      if (remainingReviews === 0) {
        return (
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 w-auto min-w-20 justify-center"
            disabled
          >
            Learn {remainingReviews}
          </Button>
        );
      }
      
      return (
        <Link href={`/deck/${slug}/study`}>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 w-auto min-w-20 justify-center bg-blue-600 hover:bg-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white border-0"
          >
            Learn {remainingReviews}
          </Button>
        </Link>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Deck
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const totalCards = row.original.totalCards as number
      const newCards = row.original.newCards as number
      const dueCards = row.original.dueCards as number
      
      return (
        <div className="space-y-1">
          <Link href={`/deck/${row.original.slug}`} className="font-medium text-primary hover:underline block">
            {name}
          </Link>
          <div className="text-sm text-muted-foreground">
            Total: {totalCards}, New: {newCards}, Due: {dueCards}
          </div>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link href={`/deck/${row.original.slug}`}>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 w-8 p-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
] 