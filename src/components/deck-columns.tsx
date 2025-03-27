"use client"

import { ColumnDef } from "@tanstack/react-table"
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
    header: "",
    cell: ({ row }) => {
      const remainingReviews = row.getValue("remainingReviews") as number
      const slug = row.original.slug
      const isNewDeckRow = row.original.id === "new-deck"
      
      if (isNewDeckRow) {
        return (
          <Button 
            variant="outline" 
            className="flex items-center gap-1 w-[96px] min-w-20 h-10 justify-center bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-white border-0"
            onClick={() => window.location.href = "/decks/new"}
          >
            Add New
          </Button>
        );
      }
      
      if (remainingReviews === 0) {
        return (
          <Button 
            variant="outline" 
            className="flex items-center gap-1 w-[96px] min-w-20 h-10 justify-center"
            disabled
          >
            Study Now
          </Button>
        );
      }
      
      return (
        <Link href={`/deck/${slug}/study`}>
          <Button 
            variant="outline" 
            className="flex items-center gap-1 w-[96px] min-w-20 h-10 justify-center bg-blue-600 hover:bg-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white border-0"
          >
            Study Now
          </Button>
        </Link>
      )
    },
  },
  {
    accessorKey: "name",
    header: "",
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const totalCards = row.original.totalCards as number
      const remainingReviews = row.original.remainingReviews as number
      const isNewDeckRow = row.original.id === "new-deck"
      
      if (isNewDeckRow) {
        return (
          <div className="space-y-1 cursor-pointer" onClick={() => window.location.href = "/decks/new"}>
            <div className="text-lg font-bold leading-tight text-slate-600 dark:text-slate-400">
              Create a new deck
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Add flashcards to study and review
            </div>
          </div>
        );
      }
      
      return (
        <div className="space-y-1">
          <Link href={`/deck/${row.original.slug}`} className="text-lg font-bold leading-tight text-primary hover:underline block">
            {name}
          </Link>
          <div className="text-sm text-slate-600 dark:text-slate-500">
            Cards: {totalCards}, Due: {remainingReviews}
          </div>
        </div>
      )
    },
  },
] 