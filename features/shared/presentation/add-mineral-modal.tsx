"use client"

import { useState, useEffect, useRef } from "react"
import { X, Search } from "lucide-react"
import { Button } from "@/features/shared/presentation/button"
import { Input } from "@/features/shared/presentation/input"
import { Label } from "@/features/shared/presentation/label"
import { Card } from "@/features/shared/presentation/card"
import { createMineral, fetchMinerals } from "@/features/shared/application/client/mineralsCrud"
import type { Mineral } from "@/types/mineral"

interface AddMineralModalProps {
  initialName?: string
  onClose: () => void
  onSuccess?: (mineral: Mineral) => void
}

export function AddMineralModal({ initialName = "", onClose, onSuccess }: AddMineralModalProps) {
  const [name, setName] = useState(initialName)
  const [chemicalFormula, setChemicalFormula] = useState("")
  const [varietyOf, setVarietyOf] = useState<Mineral | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parent mineral search state
  const [parentSearch, setParentSearch] = useState("")
  const [parentSearchResults, setParentSearchResults] = useState<Mineral[]>([])
  const [isSearchingParent, setIsSearchingParent] = useState(false)
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false)
  const parentSearchRef = useRef<HTMLDivElement>(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  // Search for parent minerals with debouncing
  useEffect(() => {
    if (!parentSearch.trim()) {
      setParentSearchResults([])
      setIsSearchingParent(false)
      return
    }

    setIsSearchingParent(true)
    const debounceTimer = setTimeout(async () => {
      try {
        const minerals = await fetchMinerals(parentSearch.trim())
        // Filter out varieties - parent must be a non-variety mineral
        setParentSearchResults(minerals.filter((m) => !m.isVariety).slice(0, 8))
      } catch {
        setParentSearchResults([])
      } finally {
        setIsSearchingParent(false)
      }
    }, 200)

    return () => clearTimeout(debounceTimer)
  }, [parentSearch])

  // Close parent dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (parentSearchRef.current && !parentSearchRef.current.contains(event.target as Node)) {
        setIsParentDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Mineral name is required")
      return
    }

    if (!varietyOf) {
      setError("Please select the parent mineral this is a variety of")
      return
    }

    setIsSubmitting(true)

    try {
      const mineral = await createMineral({
        name: name.trim(),
        chemicalFormula: chemicalFormula.trim() || undefined,
        isVariety: true,
        varietyOf: varietyOf.id,
      })
      onSuccess?.(mineral)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create mineral")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectParent = (mineral: Mineral) => {
    setVarietyOf(mineral)
    setParentSearch("")
    setIsParentDropdownOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200 mx-4">
        <Card className="border bg-card p-6 shadow-lg">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-6">
            <h2 className="text-xl font-semibold">Add New Mineral Variety</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a new variety of an existing mineral
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Amethyst"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chemicalFormula">Chemical Formula</Label>
              <Input
                id="chemicalFormula"
                value={chemicalFormula}
                onChange={(e) => setChemicalFormula(e.target.value)}
                placeholder="e.g., SiO₂"
              />
            </div>

            <div className="space-y-2" ref={parentSearchRef}>
              <Label>Variety of *</Label>
                {varietyOf ? (
                  <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {varietyOf.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{varietyOf.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setVarietyOf(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={parentSearch}
                      onChange={(e) => setParentSearch(e.target.value)}
                      onFocus={() => setIsParentDropdownOpen(true)}
                      placeholder="Search for parent mineral..."
                      className="pl-9"
                    />
                    {isParentDropdownOpen && parentSearch.trim() && (
                      <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-auto rounded-lg border bg-popover shadow-lg z-10">
                        {isSearchingParent ? (
                          <div className="p-3 text-center text-sm text-muted-foreground">
                            Searching...
                          </div>
                        ) : parentSearchResults.length === 0 ? (
                          <div className="p-3 text-center text-sm text-muted-foreground">
                            No minerals found
                          </div>
                        ) : (
                          <div className="py-1">
                            {parentSearchResults.map((mineral) => (
                              <button
                                key={mineral.id}
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 transition-colors"
                                onClick={() => handleSelectParent(mineral)}
                              >
                                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {mineral.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span>{mineral.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !name.trim() || !varietyOf}>
                {isSubmitting ? "Adding..." : "Add Variety"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
