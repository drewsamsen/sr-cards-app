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
  const [searchInputValue, setSearchInputValue] = useState("")

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInputValue(value)
    
    // If not using server-side search, update the global filter immediately
    if (!useServerSearch) {
      setGlobalFilter(value)
    }
  }

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (useServerSearch && onSearch) {
      // Update the global filter for visual consistency
      setGlobalFilter(searchInputValue)
      // Trigger the server-side search
      onSearch(searchInputValue)
    }
  }

  // Handle key press in search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If Enter key is pressed, trigger search
    if (e.key === 'Enter' && useServerSearch && onSearch) {
      setGlobalFilter(searchInputValue)
      onSearch(searchInputValue)
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
      globalFilter: useServerSearch ? globalFilter : searchInputValue,
    },
    onGlobalFilterChange: useServerSearch ? setGlobalFilter : setSearchInputValue,
    enableGlobalFilter: true,
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
    <div className="space-y-2 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div className="w-full sm:max-w-xs">
          <form onSubmit={handleSearchSubmit}>
            <Input
              placeholder={searchPlaceholder}
              value={searchInputValue}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="max-w-full"
            />
          </form>
        </div>
        {actionButton && (
          <div className="flex justify-end">{actionButton}</div>
        )}
      </div>
      
      {pagination && showTopPagination && (
        <div className="flex justify-between items-center">
          {renderPagination(true)}
        </div>
      )}
      
      <div className="rounded-md border overflow-hidden">
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
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
      </div>
      
      {pagination && (
        <div className="flex justify-between items-center">
          {renderPagination()}
        </div>
      )}
    </div>
  )
}

