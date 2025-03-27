"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Original DataTable Pagination Component
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
  // Calculate start and end item numbers
  const totalPages = Math.ceil(totalItems / pageSize)
  const startItem = Math.min(totalItems, (currentPage - 1) * pageSize + 1)
  const endItem = Math.min(totalItems, currentPage * pageSize)

  return (
    <div className={`flex flex-col ${compact ? 'sm:flex-row' : 'sm:flex-row'} items-center justify-between space-y-3 sm:space-y-0 ${compact ? 'py-2' : 'py-4'} ${className}`}>
      <div className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        {onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <p className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Rows per page</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className={`${compact ? 'h-8' : ''} w-[70px]`}>
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="hidden sm:flex"
          >
            First
          </Button>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="hidden sm:flex"
          >
            Last
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