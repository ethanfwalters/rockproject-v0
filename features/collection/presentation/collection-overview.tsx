"use client"

import { useState, useMemo } from "react"
import type { Specimen } from "@/types/specimen"
import { Card } from "@/features/shared/presentation/card"
import { Input } from "@/features/shared/presentation/input"
import { Button } from "@/features/shared/presentation/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/features/shared/presentation/dropdown-menu"
import { Search, LayoutGrid, List, ArrowUpDown, Check, ChevronUp, ChevronDown } from "lucide-react"
import Image from "next/image"

interface CollectionOverviewProps {
  specimens: Specimen[]
  onSelectSpecimen: (specimen: Specimen) => void
}

type ViewMode = "card" | "table"
type SortOption = "name" | "type" | "date" | "location" | "tags"
type SortDirection = "asc" | "desc"

export function CollectionOverview({ specimens, onSelectSpecimen }: CollectionOverviewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [viewMode, setViewMode] = useState<ViewMode>("card")

  const filteredAndSortedSpecimens = useMemo(() => {
    const filtered = specimens.filter((specimen) => {
      const query = searchQuery.toLowerCase()
      return (
        specimen.name.toLowerCase().includes(query) ||
        specimen.type.toLowerCase().includes(query) ||
        specimen.location?.toLowerCase().includes(query) ||
        specimen.description?.toLowerCase().includes(query) ||
        specimen.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "type":
          comparison = a.type.localeCompare(b.type)
          break
        case "date":
          comparison = new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          break
        case "location":
          comparison = (a.location || "").localeCompare(b.location || "")
          break
        case "tags":
          comparison = (a.tags?.length || 0) - (b.tags?.length || 0)
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
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const sortOptions = [
    { value: "date" as const, label: "Date Added" },
    { value: "name" as const, label: "Name" },
    { value: "type" as const, label: "Type" },
    { value: "location" as const, label: "Location" },
    { value: "tags" as const, label: "Tags" },
  ]

  if (specimens.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">No specimens yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your first specimen to get started</p>
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
            placeholder="Search collection..."
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
                <span className="hidden sm:inline">{sortOptions.find((opt) => opt.value === sortBy)?.label}</span>
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
                  <Check className={`mr-2 h-4 w-4 ${sortBy === option.value ? "opacity-100" : "opacity-0"}`} />
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
              <Card
                key={specimen.id}
                className="group cursor-pointer overflow-hidden border-0 bg-card transition-all hover:scale-[1.02] hover:shadow-xl"
                onClick={() => onSelectSpecimen(specimen)}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {specimen.imageUrl ? (
                    <Image
                      src={specimen.imageUrl || "/placeholder.svg"}
                      alt={specimen.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-6xl opacity-20">🪨</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-balance">{specimen.name}</h3>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                      {specimen.type}
                    </span>
                  </div>
                  {specimen.location && <p className="text-sm text-muted-foreground">{specimen.location}</p>}
                  {specimen.tags && specimen.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {specimen.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                      {specimen.tags.length > 3 && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          +{specimen.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Added {new Date(specimen.dateAdded).toLocaleDateString()}
                  </p>
                </div>
              </Card>
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
                      onClick={() => handleColumnSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        <SortIndicator column="name" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/80 transition-colors select-none"
                      onClick={() => handleColumnSort("type")}
                    >
                      <div className="flex items-center gap-1">
                        Type
                        <SortIndicator column="type" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/80 transition-colors select-none"
                      onClick={() => handleColumnSort("location")}
                    >
                      <div className="flex items-center gap-1">
                        Location
                        <SortIndicator column="location" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/80 transition-colors select-none"
                      onClick={() => handleColumnSort("tags")}
                    >
                      <div className="flex items-center gap-1">
                        Tags
                        <SortIndicator column="tags" />
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
                      onClick={() => onSelectSpecimen(specimen)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                            {specimen.imageUrl ? (
                              <Image
                                src={specimen.imageUrl || "/placeholder.svg"}
                                alt={specimen.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-lg opacity-30">🪨</div>
                            )}
                          </div>
                          <span className="font-medium">{specimen.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                          {specimen.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{specimen.location || "-"}</td>
                      <td className="px-4 py-3">
                        {specimen.tags && specimen.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {specimen.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                            {specimen.tags.length > 2 && (
                              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                +{specimen.tags.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(specimen.dateAdded).toLocaleDateString()}
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
