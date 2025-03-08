"use client"

import { useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  emptyMessage?: string
  actionButton?: React.ReactNode
  pagination?: {
    pageIndex: number
    pageSize: number
    pageCount: number
    totalItems: number
  }
  onPaginationChange?: {
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
  }
  showTopPagination?: boolean
  onSearch?: (query: string) => void
  useServerSearch?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  actionButton,
  pagination,
  onPaginationChange,
  showTopPagination = true,
  onSearch,
  useServerSearch = false
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null)

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGlobalFilter(value)
    
    // If using server-side search, debounce the search
    if (useServerSearch && onSearch) {
      if (searchDebounce) clearTimeout(searchDebounce)
      
      const debounceTimeout = setTimeout(() => {
        onSearch(value)
      }, 300) // 300ms debounce
      
      setSearchDebounce(debounceTimeout)
    }
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      globalFilter: useServerSearch ? undefined : globalFilter,
    },
    onGlobalFilterChange: useServerSearch ? undefined : setGlobalFilter,
    enableGlobalFilter: !useServerSearch,
  })

  // Render pagination controls
  const renderPagination = (isCompact: boolean = false) => {
    if (!pagination || !onPaginationChange) return null;
    
    return (
      <Pagination
        currentPage={pagination.pageIndex + 1}
        totalPages={pagination.pageCount}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        onPageChange={onPaginationChange.onPageChange}
        onPageSizeChange={onPaginationChange.onPageSizeChange}
        compact={isCompact}
      />
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between py-2">
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        {actionButton}
      </div>
      
      {/* Top pagination controls */}
      {showTopPagination && renderPagination(true)}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Bottom pagination controls */}
      {renderPagination(false)}
    </div>
  )
}

