"use client"

import * as React from "react"
import { X, ChevronUp, ChevronDown, Search, Plus, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Button } from "./button"
import { fetchMinerals, createMineral } from "@/features/shared/application/client/mineralsCrud"
import type { Mineral } from "@/types/mineral"

interface MineralMultiSelectProps {
  value: string[]
  onChange: (mineralIds: string[]) => void
  minerals?: Mineral[]
  maxSelections?: number
  className?: string
}

export function MineralMultiSelect({
  value,
  onChange,
  minerals: propMinerals,
  maxSelections,
  className,
}: MineralMultiSelectProps) {
  const [search, setSearch] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [minerals, setMinerals] = React.useState<Mineral[]>(propMinerals || [])
  const [isLoading, setIsLoading] = React.useState(!propMinerals)
  const [isCreating, setIsCreating] = React.useState(false)
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Load minerals on mount if not provided
  React.useEffect(() => {
    if (!propMinerals) {
      fetchMinerals()
        .then(setMinerals)
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [propMinerals])

  // Update minerals if prop changes
  React.useEffect(() => {
    if (propMinerals) {
      setMinerals(propMinerals)
    }
  }, [propMinerals])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedMinerals = value
    .map((id) => minerals.find((m) => m.id === id))
    .filter((m): m is Mineral => m !== undefined)

  const filteredMinerals = minerals.filter(
    (m) =>
      !value.includes(m.id) && m.name.toLowerCase().includes(search.toLowerCase())
  )

  const canAddMore = !maxSelections || value.length < maxSelections

  const handleSelect = (mineral: Mineral) => {
    if (canAddMore) {
      onChange([...value, mineral.id])
      setSearch("")
    }
  }

  const handleRemove = (mineralId: string) => {
    onChange(value.filter((id) => id !== mineralId))
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newValue = [...value]
    ;[newValue[index - 1], newValue[index]] = [newValue[index], newValue[index - 1]]
    onChange(newValue)
  }

  const handleMoveDown = (index: number) => {
    if (index === value.length - 1) return
    const newValue = [...value]
    ;[newValue[index], newValue[index + 1]] = [newValue[index + 1], newValue[index]]
    onChange(newValue)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newValue = [...value]
    const draggedItem = newValue[draggedIndex]
    newValue.splice(draggedIndex, 1)
    newValue.splice(index, 0, draggedItem)
    onChange(newValue)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleCreateMineral = async () => {
    if (!search.trim() || isCreating) return

    setIsCreating(true)
    try {
      const newMineral = await createMineral({ name: search.trim() })
      setMinerals((prev) => [...prev, newMineral].sort((a, b) => a.name.localeCompare(b.name)))
      if (canAddMore) {
        onChange([...value, newMineral.id])
      }
      setSearch("")
    } catch (error) {
      console.error("Failed to create mineral:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const getRankLabel = (index: number) => {
    const labels = ["Primary", "Secondary", "Tertiary"]
    return labels[index] || `${index + 1}th`
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Selected minerals */}
      {selectedMinerals.length > 0 && (
        <div className="mb-3 space-y-2">
          {selectedMinerals.map((mineral, index) => (
            <div
              key={mineral.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-2 rounded-md border bg-background p-2 transition-colors",
                draggedIndex === index && "opacity-50"
              )}
            >
              <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
              <span className="min-w-[70px] text-xs font-medium text-muted-foreground">
                {getRankLabel(index)}
              </span>
              <span className="flex-1 font-medium">{mineral.name}</span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="h-6 w-6"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === value.length - 1}
                  className="h-6 w-6"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemove(mineral.id)}
                  className="h-6 w-6 text-destructive hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      {canAddMore && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search minerals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-9"
          />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && canAddMore && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
          {isLoading ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              Loading minerals...
            </div>
          ) : filteredMinerals.length === 0 ? (
            <div className="p-2">
              {search.trim() ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleCreateMineral}
                  disabled={isCreating}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? "Creating..." : `Add "${search.trim()}"`}
                </Button>
              ) : (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  No minerals found
                </div>
              )}
            </div>
          ) : (
            <>
              {filteredMinerals.slice(0, 50).map((mineral) => (
                <button
                  key={mineral.id}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => handleSelect(mineral)}
                >
                  {mineral.name}
                </button>
              ))}
              {search.trim() &&
                !filteredMinerals.some(
                  (m) => m.name.toLowerCase() === search.toLowerCase()
                ) && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start border-t"
                    onClick={handleCreateMineral}
                    disabled={isCreating}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreating ? "Creating..." : `Add "${search.trim()}"`}
                  </Button>
                )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
