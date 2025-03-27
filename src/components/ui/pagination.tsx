"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// DataTable Pagination Component
interface PaginationProps {
  totalItems: number
  pageSize: number
  currentPage: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  compact?: boolean
  className?: string
}

export function DataTablePagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  compact = false,
  className
}: PaginationProps) {
  // Calculate pagination information
  const totalPages = Math.ceil(totalItems / pageSize)
  const startItem = Math.min(totalItems, (currentPage - 1) * pageSize + 1)
  const endItem = Math.min(totalItems, currentPage * pageSize)

  // Generate visible page numbers
  const getPageNumbers = () => {
    const visiblePages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // Always include first page
      visiblePages.push(1);
      
      // Calculate surrounding pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at beginning or end
      if (currentPage <= 2) {
        endPage = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        visiblePages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        visiblePages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        visiblePages.push('...');
      }
      
      // Always include last page
      if (totalPages > 1) {
        visiblePages.push(totalPages);
      }
    }
    
    return visiblePages;
  };

  return (
    <div className={cn("w-full space-y-2", compact ? 'py-2' : 'py-3', className)}>
      {/* Top row with page information and items per page */}
      <div className="flex items-center justify-between">
        <div className="pl-4 text-sm text-muted-foreground sm:pl-6 phone:text-xs phone-important:pl-2">
          Page {currentPage} of {totalPages}
        </div>
        
        <div className="pr-4 flex items-center gap-2 sm:pr-6 phone:gap-1 phone-important:pr-2">
          <span className="text-sm text-muted-foreground phone:text-xs">Items per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange?.(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px] phone:h-7 phone:w-[60px] phone:text-xs">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Bottom row with pagination controls */}
      <div className="px-4 flex justify-center w-full sm:px-6 phone-important:px-2">
        <div className="inline-flex items-center border rounded-md overflow-hidden divide-x w-full">
          {/* First page button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 px-2 rounded-none border-0 phone:h-7 phone:px-1.5"
          >
            <ChevronsLeft className="h-4 w-4 phone:h-3 phone:w-3" />
            <span className="sr-only">First Page</span>
          </Button>
          
          {/* Previous page button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 px-2 rounded-none border-0 phone:h-7 phone:px-1.5"
          >
            <ChevronLeft className="h-4 w-4 phone:h-3 phone:w-3" />
            <span className="sr-only">Previous Page</span>
          </Button>

          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <div key={`ellipsis-${index}`} className="h-8 px-3 flex items-center justify-center text-sm phone:h-7 phone:px-2 phone:text-xs">
                <MoreHorizontal className="h-4 w-4 phone:h-3 phone:w-3" />
              </div>
            ) : (
              <Button
                key={`page-${page}`}
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "h-8 px-3 rounded-none border-0 font-medium phone:h-7 phone:px-2.5 phone:text-xs",
                  currentPage === page ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                )}
              >
                {page}
              </Button>
            )
          ))}

          {/* Next page button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 px-2 rounded-none border-0 phone:h-7 phone:px-1.5"
          >
            <ChevronRight className="h-4 w-4 phone:h-3 phone:w-3" />
            <span className="sr-only">Next Page</span>
          </Button>
          
          {/* Last page button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 px-2 rounded-none border-0 phone:h-7 phone:px-1.5"
          >
            <ChevronsRight className="h-4 w-4 phone:h-3 phone:w-3" />
            <span className="sr-only">Last Page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

// New Pagination Components
const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center phone:justify-start phone:max-w-full phone:overflow-x-auto", className)}
    {...props}
  />
)

const PaginationContent = ({
  className,
  ...props
}: React.ComponentProps<"ul">) => (
  <ul
    className={cn(
      "flex flex-row items-center gap-1 phone:gap-0.5 phone:mr-2",
      className
    )}
    {...props}
  />
)

const PaginationItem = ({
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li className={cn("", className)} {...props} />
)

const PaginationLink = ({
  className,
  isActive,
  ...props
}: React.ComponentProps<"a"> & {
  isActive?: boolean
}) => (
  <PaginationItem>
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 phone:h-7 phone:w-7 phone:text-xs",
        {
          "bg-accent/60 font-medium text-accent-foreground": isActive,
        },
        className
      )}
      {...props}
    />
  </PaginationItem>
)

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<"a">) => (
  <PaginationLink
    aria-label="Go to previous page"
    className={cn("gap-1 pl-2.5 pr-3.5 phone:gap-0.5 phone:pl-1.5 phone:pr-2.5", className)}
    {...props}
  >
    <ChevronLeft className="size-4 phone:size-3" />
    <span>Previous</span>
  </PaginationLink>
)

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<"a">) => (
  <PaginationLink
    aria-label="Go to next page"
    className={cn("gap-1 pl-3.5 pr-2.5 phone:gap-0.5 phone:pl-2.5 phone:pr-1.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="size-4 phone:size-3" />
  </PaginationLink>
)

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center phone:h-7 phone:w-7", className)}
    {...props}
  >
    <MoreHorizontal className="size-4 phone:size-3" />
    <span className="sr-only">More pages</span>
  </span>
)

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} 