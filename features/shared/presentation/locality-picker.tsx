"use client"

import * as React from "react"
import { ArrowLeft, Check, ChevronRight, MapPin, Plus, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Button } from "./button"
import { Label } from "./label"
import {
  fetchLocalities,
  fetchLocalityWithAncestors,
  createLocality,
} from "@/features/shared/application/client/localitiesCrud"
import type { Locality, LocalityWithAncestors } from "@/types/locality"

interface LocalityPickerProps {
  value?: string
  onChange: (localityId: string | undefined) => void
  className?: string
}

interface AddLocalityFormData {
  name: string
  kind: string
  latitude: string
  longitude: string
}

export function LocalityPicker({ value, onChange, className }: LocalityPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [selectedLocality, setSelectedLocality] = React.useState<LocalityWithAncestors | null>(null)
  const [breadcrumb, setBreadcrumb] = React.useState<Locality[]>([])
  const [currentLocalities, setCurrentLocalities] = React.useState<Locality[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [addFormData, setAddFormData] = React.useState<AddLocalityFormData>({
    name: "",
    kind: "",
    latitude: "",
    longitude: "",
  })
  const [isCreating, setIsCreating] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Load selected locality on mount
  React.useEffect(() => {
    if (value) {
      fetchLocalityWithAncestors(value)
        .then(setSelectedLocality)
        .catch(console.error)
    } else {
      setSelectedLocality(null)
    }
  }, [value])

  // Load root localities (countries) when opening
  React.useEffect(() => {
    if (isOpen && breadcrumb.length === 0 && !search) {
      setIsLoading(true)
      fetchLocalities({ roots: true })
        .then(setCurrentLocalities)
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, breadcrumb.length, search])

  // Search localities
  React.useEffect(() => {
    if (!search) {
      // When search is cleared, reload current level
      if (breadcrumb.length === 0) {
        fetchLocalities({ roots: true })
          .then(setCurrentLocalities)
          .catch(console.error)
      } else {
        const parentId = breadcrumb[breadcrumb.length - 1].id
        fetchLocalities({ parentId })
          .then(setCurrentLocalities)
          .catch(console.error)
      }
      return
    }

    const timeoutId = setTimeout(() => {
      setIsLoading(true)
      fetchLocalities({ search })
        .then(setCurrentLocalities)
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, breadcrumb])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowAddForm(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectLocality = (locality: Locality) => {
    onChange(locality.id)
    setIsOpen(false)
    setSearch("")
    setBreadcrumb([])
  }

  const handleDrillDown = async (locality: Locality) => {
    setIsLoading(true)
    setBreadcrumb((prev) => [...prev, locality])
    try {
      const children = await fetchLocalities({ parentId: locality.id })
      setCurrentLocalities(children)
      setSearch('')
    } catch (error) {
      console.error("Failed to fetch children:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBreadcrumbClick = async (index: number) => {
    if (index === -1) {
      // Go to root
      setBreadcrumb([])
      setIsLoading(true)
      try {
        const roots = await fetchLocalities({ roots: true })
        setCurrentLocalities(roots)
      } catch (error) {
        console.error("Failed to fetch roots:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      // Go to specific level
      const newBreadcrumb = breadcrumb.slice(0, index + 1)
      setBreadcrumb(newBreadcrumb)
      setIsLoading(true)
      try {
        const children = await fetchLocalities({ parentId: newBreadcrumb[index].id })
        setCurrentLocalities(children)
      } catch (error) {
        console.error("Failed to fetch children:", error)
      } finally {
        setIsLoading(false)
      }
    }
    setSearch("")
  }

  const handleClear = () => {
    onChange(undefined)
    setSelectedLocality(null)
  }

  const handleCreateLocality = async () => {
    if (!addFormData.name.trim() || !addFormData.kind.trim() || isCreating) return

    setIsCreating(true)
    try {
      const parentId = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].id : undefined
      const newLocality = await createLocality({
        name: addFormData.name.trim(),
        kind: addFormData.kind.trim(),
        parentId,
        latitude: addFormData.latitude ? parseFloat(addFormData.latitude) : undefined,
        longitude: addFormData.longitude ? parseFloat(addFormData.longitude) : undefined,
      })

      // Add to current list and select it
      setCurrentLocalities((prev) =>
        [...prev, newLocality].sort((a, b) => a.name.localeCompare(b.name))
      )
      // handleSelectLocality(newLocality)
      setShowAddForm(false)
      setAddFormData({ name: "", kind: "", latitude: "", longitude: "" })
    } catch (error) {
      console.error("Failed to create locality:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const suggestedKinds = ["state", "province", "county", "district", "city", "mine", "quarry", "deposit", "region"]

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Selected locality display */}
      {selectedLocality ? (
        <div className="flex items-center gap-2 rounded-md border bg-background p-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="font-medium">{selectedLocality.name}</div>
            {selectedLocality.fullPath !== selectedLocality.name && (
              <div className="text-sm text-muted-foreground">{selectedLocality.fullPath}</div>
            )}
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          onClick={() => setIsOpen(true)}
        >
          <MapPin className="mr-2 h-4 w-4" />
          Select locality...
        </Button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {/* Navigation header with breadcrumb and back button */}
          {breadcrumb.length > 0 && (
            <div className="flex items-center gap-1 border-b px-2 py-2 text-sm">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleBreadcrumbClick(breadcrumb.length - 2)}
                title="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => handleBreadcrumbClick(-1)}
              >
                Countries
              </button>
              {breadcrumb.map((loc, index) => (
                <React.Fragment key={loc.id}>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <button
                    type="button"
                    className={cn(
                      "hover:text-foreground truncate",
                      index === breadcrumb.length - 1 ? "font-medium" : "text-muted-foreground"
                    )}
                    onClick={() => handleBreadcrumbClick(index)}
                  >
                    {loc.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="border-b p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search localities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Add form */}
          {showAddForm ? (
            <div className="space-y-3 p-3">
              <div>
                <Label>Name</Label>
                <Input
                  type="text"
                  placeholder="Locality name"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Kind</Label>
                <Input
                  type="text"
                  placeholder="e.g., mine, quarry, state"
                  value={addFormData.kind}
                  onChange={(e) => setAddFormData((prev) => ({ ...prev, kind: e.target.value }))}
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  {suggestedKinds.map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      className="rounded bg-secondary px-2 py-0.5 text-xs hover:bg-secondary/80"
                      onClick={() => setAddFormData((prev) => ({ ...prev, kind }))}
                    >
                      {kind}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Latitude (optional)</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="e.g., 39.7392"
                    value={addFormData.latitude}
                    onChange={(e) => setAddFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Longitude (optional)</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="e.g., -104.9903"
                    value={addFormData.longitude}
                    onChange={(e) => setAddFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddForm(false)
                    setAddFormData({ name: "", kind: "", latitude: "", longitude: "" })
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleCreateLocality}
                  disabled={!addFormData.name.trim() || !addFormData.kind.trim() || isCreating}
                >
                  {isCreating ? "Creating..." : "Add"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Select current location option */}
              {breadcrumb.length > 0 && !search && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 border-b bg-accent/50 px-3 py-2 text-left hover:bg-accent"
                  onClick={() => handleSelectLocality(breadcrumb[breadcrumb.length - 1])}
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">Use {breadcrumb[breadcrumb.length - 1].name}</div>
                    <div className="text-xs text-muted-foreground">{breadcrumb[breadcrumb.length - 1].kind}</div>
                  </div>
                  <Check className="h-4 w-4 text-primary" />
                </button>
              )}

              {/* Localities list */}
              <div className="max-h-60 overflow-auto">
                {isLoading ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">Loading...</div>
                ) : currentLocalities.length === 0 ? (
                  <div className="p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-3">
                      No sub-localities found
                    </div>
                    {breadcrumb.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleBreadcrumbClick(breadcrumb.length - 2)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go back
                      </Button>
                    )}
                  </div>
                ) : (
                  currentLocalities.map((locality) => (
                    <div
                      key={locality.id}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-accent cursor-pointer"
                      onClick={() => handleDrillDown(locality)}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title="Select this locality"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectLocality(locality)
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{locality.name}</div>
                        <div className="text-xs text-muted-foreground">{locality.kind}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  ))
                )}
              </div>

              {/* Add new locality button */}
              <div className="border-t p-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add new locality
                  {breadcrumb.length > 0 && (
                    <span className="ml-1 text-muted-foreground">
                      in {breadcrumb[breadcrumb.length - 1].name}
                    </span>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
