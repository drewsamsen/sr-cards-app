"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
  compact?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  compact = false
}: PaginationProps) {
  // Calculate start and end item numbers
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className={`flex flex-col ${compact ? 'sm:flex-row' : 'sm:flex-row'} items-center justify-between space-y-3 sm:space-y-0 ${compact ? 'py-2' : 'py-4'}`}>
      <div className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> items
      </div>
      <div className={`flex items-center ${compact ? 'space-x-2 sm:space-x-4' : 'space-x-6 lg:space-x-8'}`}>
        {!compact && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className={`${compact ? 'h-7 w-7' : 'h-8 w-8'} p-0`}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`${compact ? 'h-7 w-7' : 'h-8 w-8'} p-0`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
          </Button>
          <div className="flex items-center gap-1">
            <span className={`text-sm ${compact ? '' : 'font-medium'}`}>{currentPage}</span>
            <span className="text-sm text-muted-foreground">of</span>
            <span className={`text-sm ${compact ? '' : 'font-medium'}`}>{totalPages || 1}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className={`${compact ? 'h-7 w-7' : 'h-8 w-8'} p-0`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`${compact ? 'h-7 w-7' : 'h-8 w-8'} p-0`}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
          </Button>
        </div>
        {compact && (
          <div className="flex items-center space-x-2">
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-7 w-[60px]">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">per page</span>
          </div>
        )}
      </div>
    </div>
  )
} 