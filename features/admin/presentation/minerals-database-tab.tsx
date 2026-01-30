"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card } from "@/features/shared/presentation/card"
import { Input } from "@/features/shared/presentation/input"
import { Button } from "@/features/shared/presentation/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { fetchAdminMinerals } from "@/features/admin/application/client/mineralsAdmin"
import { EditMineralDialog } from "@/features/admin/presentation/edit-mineral-dialog"
import type { AdminMineral } from "@/features/admin/domain/types"

export function MineralsDatabaseTab() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [editingMineral, setEditingMineral] = useState<AdminMineral | null>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ["admin-minerals", debouncedSearch, page],
    queryFn: () => fetchAdminMinerals({ search: debouncedSearch, page, limit: 50 }),
  })

  const minerals = data?.minerals || []
  const stats = data?.stats || { total: 0, nonVarieties: 0, varieties: 0 }
  const pagination = data?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 }

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Minerals</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Non-Varieties</p>
          <p className="text-2xl font-bold">{stats.nonVarieties}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Varieties</p>
          <p className="text-2xl font-bold">{stats.varieties}</p>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search minerals by name..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Chemical Formula</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Variety</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Parent Mineral</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : minerals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No minerals found
                  </td>
                </tr>
              ) : (
                minerals.map((mineral) => (
                  <tr
                    key={mineral.id}
                    className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setEditingMineral(mineral)}
                  >
                    <td className="px-6 py-4 font-medium capitalize">{mineral.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {mineral.chemicalFormula || "\u2014"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          mineral.isVariety
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {mineral.isVariety ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground capitalize">
                      {mineral.varietyOfMineral?.name || "\u2014"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(mineral.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-border px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <EditMineralDialog
        mineral={editingMineral}
        onOpenChange={(open) => { if (!open) setEditingMineral(null) }}
      />
    </div>
  )
}
