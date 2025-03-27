"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
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
      
      if (remainingReviews === 0) {
        return (
          <Button 
            variant="outline" 
            className="flex items-center gap-1 w-auto min-w-20 h-10 justify-center"
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
            className="flex items-center gap-1 w-auto min-w-20 h-10 justify-center bg-blue-600 hover:bg-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white border-0"
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
      
      return (
        <div className="space-y-1">
          <Link href={`/deck/${row.original.slug}`} className="text-lg font-bold leading-tight text-primary hover:underline block">
            {name}
          </Link>
          <div className="text-sm text-slate-600 dark:text-slate-600">
            Cards: {totalCards}, Due: {remainingReviews}
          </div>
        </div>
      )
    },
  },
] 