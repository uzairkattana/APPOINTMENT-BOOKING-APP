import { useState, useMemo, useEffect } from 'react'

interface PaginationSettings {
  recordsPerPage: number
  enablePagination: boolean
  showPageNumbers: boolean
  showRecordCount: boolean
  showJumpToPage: boolean
  maxVisiblePages: number
  paginationStyle: string
  autoRefresh: boolean
  virtualScrolling: boolean
}

interface UsePaginationProps<T> {
  data: T[]
  defaultPageSize?: number
  searchTerm?: string
  filters?: Record<string, any>
}

interface PaginationResult<T> {
  currentData: T[]
  currentPage: number
  totalPages: number
  totalRecords: number
  recordsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  startRecord: number
  endRecord: number
  setCurrentPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  goToPage: (page: number) => void
  setRecordsPerPage: (size: number) => void
  isFirstPage: boolean
  isLastPage: boolean
  pageNumbers: number[]
  settings: PaginationSettings
}

export function usePagination<T>({
  data,
  defaultPageSize = 150,
  searchTerm = '',
  filters = {}
}: UsePaginationProps<T>): PaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(defaultPageSize)
  const [settings, setSettings] = useState<PaginationSettings>({
    recordsPerPage: defaultPageSize,
    enablePagination: true,
    showPageNumbers: true,
    showRecordCount: true,
    showJumpToPage: true,
    maxVisiblePages: 5,
    paginationStyle: "professional",
    autoRefresh: false,
    virtualScrolling: false,
  })

  // Load pagination settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('pagination_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        setRecordsPerPage(parsed.recordsPerPage || defaultPageSize)
      } catch (error) {
        console.error('Error loading pagination settings:', error)
      }
    }
  }, [defaultPageSize])

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(item => {
        const searchableString = JSON.stringify(item).toLowerCase()
        return searchableString.includes(searchTerm.toLowerCase())
      })
    }

    // Apply custom filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(item => {
          const itemValue = (item as any)[key]
          return itemValue === value
        })
      }
    })

    return result
  }, [data, searchTerm, filters])

  // Calculate pagination values
  const totalRecords = filteredData.length
  const totalPages = Math.ceil(totalRecords / recordsPerPage)
  
  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  // Calculate current page data
  const currentData = useMemo(() => {
    if (!settings.enablePagination) {
      return filteredData
    }

    const startIndex = (currentPage - 1) * recordsPerPage
    const endIndex = startIndex + recordsPerPage
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, recordsPerPage, settings.enablePagination])

  // Calculate visible page numbers
  const pageNumbers = useMemo(() => {
    if (!settings.showPageNumbers || totalPages <= 1) return []

    const maxVisible = settings.maxVisiblePages
    const halfVisible = Math.floor(maxVisible / 2)
    
    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }
    
    const pages = []
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }, [currentPage, totalPages, settings.maxVisiblePages, settings.showPageNumbers])

  // Navigation functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const updateRecordsPerPage = (size: number) => {
    setRecordsPerPage(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  // Calculate record range
  const startRecord = settings.enablePagination 
    ? (currentPage - 1) * recordsPerPage + 1
    : 1
  
  const endRecord = settings.enablePagination
    ? Math.min(currentPage * recordsPerPage, totalRecords)
    : totalRecords

  return {
    currentData,
    currentPage,
    totalPages,
    totalRecords,
    recordsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    startRecord,
    endRecord,
    setCurrentPage,
    nextPage,
    previousPage,
    goToPage,
    setRecordsPerPage: updateRecordsPerPage,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    pageNumbers,
    settings
  }
}

// Helper hook for keyboard navigation
export function usePaginationKeyboard(pagination: PaginationResult<any>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if no input is focused
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          pagination.previousPage()
          break
        case 'ArrowRight':
          event.preventDefault()
          pagination.nextPage()
          break
        case 'Home':
          event.preventDefault()
          pagination.goToPage(1)
          break
        case 'End':
          event.preventDefault()
          pagination.goToPage(pagination.totalPages)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pagination])
}
