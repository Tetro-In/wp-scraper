'use client'

import { useState, useMemo } from 'react'

export function useSearchPagination<T>(
  data: T[],
  searchFields: (item: T) => string[],
  defaultItemsPerPage = 10
) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage)

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data
    }

    const query = searchQuery.toLowerCase()
    return data.filter((item) => {
      const searchableText = searchFields(item)
        .map((field) => String(field || '').toLowerCase())
        .join(' ')
      return searchableText.includes(query)
    })
  }, [data, searchQuery, searchFields])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleItemsPerPageChange = (items: number) => {
    const clampedItems = Math.min(100, Math.max(1, items))
    setItemsPerPage(clampedItems)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Reset to page 1 when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedData,
    filteredData,
    handlePageChange,
    handleItemsPerPageChange,
  }
}

