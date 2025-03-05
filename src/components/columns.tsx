"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Define the type for our data
export type Product = {
  id: string
  name: string
  due: number
  total: number
}

// Define the columns for our table
export const columns: ColumnDef<Product>[] = [
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
        <Link href={`/decks/${row.original.id}`} className="font-medium text-primary hover:underline">
          {name}
        </Link>
      )
    },
  },
  {
    accessorKey: "due",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Due
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const due = row.getValue("due") as number
      return <div className="font-medium">{due} cards</div>
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const total = row.getValue("total") as number
      return <div className="font-medium">{total} cards</div>
    },
  },
  {
    id: "edit",
    header: "Edit",
    cell: ({ row }) => (
      <Link href={`/decks/${row.original.id}/edit`} className="text-primary hover:underline">
        Edit
      </Link>
    ),
  },
]

