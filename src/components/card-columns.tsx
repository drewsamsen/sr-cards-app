"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Define the type for our data
export type Card = {
  id: string
  question: string
  slug: string
  lastReviewed: string
  deck: string
  difficulty: number
}

// Define the columns for our table
export const cardColumns: ColumnDef<Card>[] = [
  {
    accessorKey: "question",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Question
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const question = row.getValue("question") as string
      return (
        <Link href={`/card/${row.original.slug}`} className="font-medium text-primary hover:underline">
          {question}
        </Link>
      )
    },
  },
  {
    accessorKey: "deck",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Deck
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const deck = row.getValue("deck") as string
      return <div className="font-medium">{deck}</div>
    },
  },
  {
    accessorKey: "lastReviewed",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Last Reviewed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const lastReviewed = row.getValue("lastReviewed") as string
      return <div className="font-medium">{lastReviewed}</div>
    },
  },
  {
    accessorKey: "difficulty",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Difficulty
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const difficulty = row.getValue("difficulty") as number
      return <div className="font-medium">{difficulty}/5</div>
    },
  },
  {
    id: "edit",
    header: "Edit",
    cell: ({ row }) => (
      <Link href={`/card/${row.original.slug}/edit`} className="text-primary hover:underline">
        Edit
      </Link>
    ),
  },
] 