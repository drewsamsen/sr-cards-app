"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Settings, BookOpen } from "lucide-react"
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
            className="flex items-center gap-1 w-16 justify-center"
            disabled
          >
            <BookOpen className="h-4 w-4" />
            {remainingReviews}
          </Button>
        );
      }
      
      return (
        <Link href={`/deck/${slug}/study`}>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 w-16 justify-center"
          >
            <BookOpen className="h-4 w-4" />
            {remainingReviews}
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
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      return (
        <Link href={`/deck/${row.original.slug}`} className="font-medium text-primary hover:underline">
          {name}
        </Link>
      )
    },
  },
  {
    accessorKey: "totalCards",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Cards
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const totalCards = row.getValue("totalCards") as number
      const newCards = row.original.newCards as number
      const dueCards = row.original.dueCards as number
      
      return (
        <div className="flex flex-col">
          <div className="font-medium">Total: {totalCards}</div>
          <div className="text-sm text-muted-foreground">New: {newCards}</div>
          <div className="text-sm text-muted-foreground">Due: {dueCards}</div>
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