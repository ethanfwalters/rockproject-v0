"use client"

import { useState, useMemo } from "react"
import type { Specimen } from "@/types/specimen"
import { Input } from "@/features/shared/presentation/input"
import { Button } from "@/features/shared/presentation/button"
import { SpecimenCard } from "@/features/shared/presentation/specimen-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/features/shared/presentation/dropdown-menu"
import { Search, LayoutGrid, List, ArrowUpDown, Check, ChevronUp, ChevronDown, Gem } from "lucide-react"
import Image from "next/image"
import { formatDimensions } from "@/features/shared/presentation/dimensions-input"
import type { CollectionOverviewProps, ViewMode, SortOption, SortDirection } from "../domain/types"

export function CollectionOverview({ specimens, onSelectSpecimen }: CollectionOverviewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [viewMode, setViewMode] = useState<ViewMode>("card")

  const filteredAndSortedSpecimens = useMemo(() => {
    const filtered = specimens.filter((specimen) => {
      const query = searchQuery.toLowerCase()
      const mineralNames = specimen.minerals?.map((m) => m.name.toLowerCase()).join(" ") || ""
      const localityName = specimen.locality?.name?.toLowerCase() || ""
      const localityPath = specimen.locality?.fullPath?.toLowerCase() || ""

      return (
        mineralNames.includes(query) || localityName.includes(query) || localityPath.includes(query)
      )
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "mineral":
          const aMineral = a.minerals?.[0]?.name || ""
          const bMineral = b.minerals?.[0]?.name || ""
          comparison = aMineral.localeCompare(bMineral)
          break
        case "locality":
          const aLocality = a.locality?.name || ""
          const bLocality = b.locality?.name || ""
          comparison = aLocality.localeCompare(bLocality)
          break
        case "date":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
        case "dimensions":
          const aSize = (a.length || 0) * (a.width || 0) * (a.height || 0)
          const bSize = (b.length || 0) * (b.width || 0) * (b.height || 0)
          comparison = bSize - aSize
          break
        default:
          comparison = 0
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [specimens, searchQuery, sortBy, sortDirection])

  const handleColumnSort = (column: SortOption) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(column)
      setSortDirection(column === "date" ? "desc" : "asc")
    }
  }

  const SortIndicator = ({ column }: { column: SortOption }) => {
    if (sortBy !== column) return null
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  const sortOptions = [
    { value: "date" as const, label: "Date Added" },
    { value: "mineral" as const, label: "Mineral" },
    { value: "locality" as const, label: "Locality" },
    { value: "dimensions" as const, label: "Size" },
  ]

  // Helper to get primary mineral name
  const getPrimaryMineral = (specimen: Specimen) => {
    return specimen.minerals?.[0]?.name || "Unknown"
  }

  // Helper to get additional minerals count
  const getAdditionalMineralsCount = (specimen: Specimen) => {
    return (specimen.minerals?.length || 0) - 1
  }

  if (specimens.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">No specimens yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first specimen to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by mineral or locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {sortOptions.find((opt) => opt.value === sortBy)?.label}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value)
                    setSortDirection(option.value === "date" ? "desc" : "asc")
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${sortBy === option.value ? "opacity-100" : "opacity-0"}`}
                  />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode("card")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredAndSortedSpecimens.length === 0 && (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border-2 border-dashed">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">No specimens found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search</p>
          </div>
        </div>
      )}

      {filteredAndSortedSpecimens.length > 0 &&
        (viewMode === "card" ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
            {filteredAndSortedSpecimens.map((specimen) => (
              <SpecimenCard
                key={specimen.id}
                name={getPrimaryMineral(specimen)}
                imageUrl={specimen.imageUrl}
                locality={specimen.locality?.fullPath || specimen.locality?.name || null}
                dateAdded={specimen.createdAt}
                additionalMineralsCount={getAdditionalMineralsCount(specimen)}
                dimensions={formatDimensions(specimen.length, specimen.width, specimen.height) || null}
                onClick={() => onSelectSpecimen(specimen.id)}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/80 transition-colors select-none"
                      onClick={() => handleColumnSort("mineral")}
                    >
                      <div className="flex items-center gap-1">
                        Primary Mineral
                        <SortIndicator column="mineral" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Other Minerals</th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/80 transition-colors select-none"
                      onClick={() => handleColumnSort("locality")}
                    >
                      <div className="flex items-center gap-1">
                        Locality
                        <SortIndicator column="locality" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/80 transition-colors select-none"
                      onClick={() => handleColumnSort("dimensions")}
                    >
                      <div className="flex items-center gap-1">
                        Dimensions
                        <SortIndicator column="dimensions" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/80 transition-colors select-none"
                      onClick={() => handleColumnSort("date")}
                    >
                      <div className="flex items-center gap-1">
                        Date Added
                        <SortIndicator column="date" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAndSortedSpecimens.map((specimen) => (
                    <tr
                      key={specimen.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => onSelectSpecimen(specimen.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                            {specimen.imageUrl ? (
                              <Image
                                src={specimen.imageUrl || "/placeholder.svg"}
                                alt={getPrimaryMineral(specimen)}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Gem className="h-5 w-5 opacity-30" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{getPrimaryMineral(specimen)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {specimen.minerals && specimen.minerals.length > 1 ? (
                          <div className="flex flex-wrap gap-1">
                            {specimen.minerals.slice(1, 3).map((mineral) => (
                              <span
                                key={mineral.id}
                                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                              >
                                {mineral.name}
                              </span>
                            ))}
                            {specimen.minerals.length > 3 && (
                              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                +{specimen.minerals.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate" title={specimen.locality?.fullPath || specimen.locality?.name}>
                        {specimen.locality?.fullPath || specimen.locality?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDimensions(specimen.length, specimen.width, specimen.height) || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(specimen.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  )
}
