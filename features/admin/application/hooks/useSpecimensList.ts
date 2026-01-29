"use client"

import { useState, useEffect, useCallback } from "react"
import type { AdminSpecimen, Pagination } from "@/features/admin/domain/types"
import { fetchAdminSpecimens, deleteAdminSpecimen } from "@/features/admin/application/client/specimensCrud"

export function useSpecimensList() {
  const [specimens, setSpecimens] = useState<AdminSpecimen[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadSpecimens = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminSpecimens({
        page,
        limit: 20,
        search,
        type: typeFilter,
        sortBy,
        sortOrder,
      })
      setSpecimens(data.specimens)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching specimens:", error)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, sortBy, sortOrder, page])

  useEffect(() => {
    loadSpecimens()
  }, [loadSpecimens])

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      await deleteAdminSpecimen(id)
      setDeleteId(null)
      loadSpecimens()
    } catch (error) {
      console.error("Error deleting specimen:", error)
      alert("Failed to delete specimen")
    } finally {
      setDeleting(false)
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleTypeFilterChange(value: string) {
    setTypeFilter(value)
    setPage(1)
  }

  function handleSortChange(value: string) {
    const [newSortBy, newSortOrder] = value.split("-")
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  return {
    specimens,
    loading,
    search,
    typeFilter,
    sortBy,
    sortOrder,
    page,
    pagination,
    deleteId,
    deleting,
    setPage,
    setDeleteId,
    handleDelete,
    handleSearchChange,
    handleTypeFilterChange,
    handleSortChange,
  }
}
