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
  reviewCount: number
  totalCards: number
}

// Define the columns for our table
export const deckColumns: ColumnDef<Deck>[] = [
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
    accessorKey: "reviewCount",
    header: () => <div className="sr-only">Due for Review</div>,
    cell: ({ row }) => {
      const reviewCount = row.getValue("reviewCount") as number
      const slug = row.original.slug
      
      if (reviewCount === 0) {
        return <div className="text-muted-foreground">No cards due</div>
      }
      
      return (
        <Link href={`/deck/${slug}/study`}>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-32 text-center"
          >
            Review {reviewCount} {reviewCount === 1 ? 'Card' : 'Cards'}
          </Button>
        </Link>
      )
    },
  },
  {
    accessorKey: "totalCards",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Total Cards
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const totalCards = row.getValue("totalCards") as number
      return <div className="font-medium">{totalCards}</div>
    },
  },
  {
    id: "edit",
    header: "Edit",
    cell: ({ row }) => (
      <Link href={`/deck/${row.original.slug}/edit`} className="text-primary hover:underline">
        Edit
      </Link>
    ),
  },
] 