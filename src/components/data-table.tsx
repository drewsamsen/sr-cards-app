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
import { DataTablePagination } from "@/components/ui/pagination"

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
  hideSearch?: boolean
  hideHeader?: boolean
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
  useServerSearch = false,
  hideSearch = false,
  hideHeader = false
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
      <DataTablePagination
        currentPage={pagination.pageIndex + 1}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        onPageChange={onPaginationChange.onPageChange}
        onPageSizeChange={onPaginationChange.onPageSizeChange}
        compact={isCompact}
      />
    );
  };

  return (
    <div className="space-y-2 sm:space-y-4 phone:space-y-2">
      <div className="px-4 flex flex-row items-center justify-between gap-2 sm:gap-4 sm:px-6 phone:gap-1 phone:flex-wrap phone-important:px-2">
        {!hideSearch && (
          <div className="w-full max-w-xs phone:max-w-full">
            <form onSubmit={handleSearchSubmit}>
              <Input
                placeholder={searchPlaceholder}
                value={searchInputValue}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="max-w-full phone:h-8 phone:text-sm"
              />
            </form>
          </div>
        )}
        {actionButton && (
          <div className="flex justify-end ml-auto phone:mt-2 phone:w-full phone:ml-0">{actionButton}</div>
        )}
      </div>
      
      {pagination && showTopPagination && (
        <div>
          {renderPagination(true)}
        </div>
      )}
      
      <div className="mx-0 rounded-md border overflow-hidden sm:mx-0 phone:rounded-sm phone:border-gray-200 phone:dark:border-gray-800 phone-important:mx-0">
        <div className="w-full overflow-auto phone:overflow-x-auto phone:overflow-y-hidden">
          <Table>
            {!hideHeader && (
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
            )}
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
        <div>
          {renderPagination()}
        </div>
      )}
    </div>
  )
}

