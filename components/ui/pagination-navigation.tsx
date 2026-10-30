"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal,
  Search,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationNavigationProps {
  currentPage: number
  totalPages: number
  totalRecords: number
  recordsPerPage: number
  startRecord: number
  endRecord: number
  pageNumbers: number[]
  hasNextPage: boolean
  hasPreviousPage: boolean
  isFirstPage: boolean
  isLastPage: boolean
  showPageNumbers?: boolean
  showRecordCount?: boolean
  showJumpToPage?: boolean
  paginationStyle?: 'professional' | 'simple' | 'compact'
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onGoToPage: (page: number) => void
  onRefresh?: () => void
  onExport?: () => void
  className?: string
}

export function PaginationNavigation({
  currentPage,
  totalPages,
  totalRecords,
  recordsPerPage,
  startRecord,
  endRecord,
  pageNumbers,
  hasNextPage,
  hasPreviousPage,
  isFirstPage,
  isLastPage,
  showPageNumbers = true,
  showRecordCount = true,
  showJumpToPage = true,
  paginationStyle = 'professional',
  onPageChange,
  onPageSizeChange,
  onGoToPage,
  onRefresh,
  onExport,
  className
}: PaginationNavigationProps) {
  const [jumpToPageValue, setJumpToPageValue] = useState('')

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPageValue)
    if (pageNum >= 1 && pageNum <= totalPages) {
      onGoToPage(pageNum)
      setJumpToPageValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage()
    }
  }

  if (paginationStyle === 'compact') {
    return (
      <div className={cn("flex items-center justify-between py-2", className)}>
        <div className="text-sm text-gray-600">
          {showRecordCount && (
            <span>{startRecord}-{endRecord} of {totalRecords}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPreviousPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (paginationStyle === 'simple') {
    return (
      <div className={cn("flex items-center justify-between py-4", className)}>
        {showRecordCount && (
          <div className="text-sm text-gray-600">
            Showing {startRecord} to {endRecord} of {totalRecords} patients
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPreviousPage}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  // Professional style (default)
  return (
    <div className={cn("bg-white border-t border-gray-200 px-4 py-3 sm:px-6", className)}>
      {/* Mobile view */}
      <div className="flex items-center justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          {/* Record count */}
          {showRecordCount && (
            <div className="text-sm text-gray-700">
              <p>
                Showing <span className="font-semibold">{startRecord}</span> to{' '}
                <span className="font-semibold">{endRecord}</span> of{' '}
                <span className="font-semibold">{totalRecords}</span> patients
              </p>
            </div>
          )}

          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show:</span>
            <Select value={recordsPerPage.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="150">150</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="500">500</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-700">per page</span>
          </div>

          {/* Jump to page */}
          {showJumpToPage && totalPages > 5 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Go to page:</span>
              <Input
                type="number"
                min="1"
                max={totalPages}
                value={jumpToPageValue}
                onChange={(e) => setJumpToPageValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-16 h-8 text-center"
                placeholder="1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleJumpToPage}
                disabled={!jumpToPageValue || parseInt(jumpToPageValue) < 1 || parseInt(jumpToPageValue) > totalPages}
              >
                Go
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Pagination navigation */}
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {/* First page */}
            <Button
              variant="outline"
              onClick={() => onPageChange(1)}
              disabled={isFirstPage}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md border-r-0"
            >
              <span className="sr-only">First page</span>
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            </Button>

            {/* Previous page */}
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPreviousPage}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed border-r-0"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>

            {/* Page numbers */}
            {showPageNumbers && (
              <>
                {/* Show ellipsis if needed */}
                {pageNumbers[0] > 1 && (
                  <>
                    <Button
                      variant={currentPage === 1 ? "default" : "outline"}
                      onClick={() => onPageChange(1)}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:z-20 border-r-0"
                    >
                      1
                    </Button>
                    {pageNumbers[0] > 2 && (
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 border border-gray-300 border-r-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </span>
                    )}
                  </>
                )}

                {/* Visible page numbers */}
                {pageNumbers.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    onClick={() => onPageChange(pageNumber)}
                    className={cn(
                      "relative inline-flex items-center px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:z-20 border-r-0",
                      currentPage === pageNumber && "bg-[#0d5c75] text-white hover:bg-[#0a4a5c]"
                    )}
                  >
                    {pageNumber}
                  </Button>
                ))}

                {/* Show ellipsis if needed */}
                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                  <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 border border-gray-300 border-r-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </span>
                    )}
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      onClick={() => onPageChange(totalPages)}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:z-20 border-r-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Next page */}
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed border-r-0"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>

            {/* Last page */}
            <Button
              variant="outline"
              onClick={() => onPageChange(totalPages)}
              disabled={isLastPage}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md"
            >
              <span className="sr-only">Last page</span>
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  )
}
