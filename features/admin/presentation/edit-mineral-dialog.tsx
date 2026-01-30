"use client"

import { useState, useEffect, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/features/shared/presentation/dialog"
import { Input } from "@/features/shared/presentation/input"
import { Button } from "@/features/shared/presentation/button"
import { Switch } from "@/features/shared/presentation/switch"
import { Label } from "@/features/shared/presentation/label"
import { updateMineral, fetchAdminMinerals } from "@/features/admin/application/client/mineralsAdmin"
import type { AdminMineral, UpdateMineralInput } from "@/features/admin/domain/types"

interface EditMineralDialogProps {
  mineral: AdminMineral | null
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditMineralDialog({ mineral, onOpenChange, onSuccess }: EditMineralDialogProps) {
  const queryClient = useQueryClient()

  const [name, setName] = useState("")
  const [chemicalFormula, setChemicalFormula] = useState("")
  const [isVariety, setIsVariety] = useState(false)
  const [varietyOf, setVarietyOf] = useState<string | null>(null)
  const [parentSearch, setParentSearch] = useState("")
  const [debouncedParentSearch, setDebouncedParentSearch] = useState("")
  const [parentResults, setParentResults] = useState<{ id: string; name: string }[]>([])
  const [parentSearching, setParentSearching] = useState(false)
  const [selectedParentName, setSelectedParentName] = useState("")

  // Reset form when mineral changes
  useEffect(() => {
    if (mineral) {
      setName(mineral.name)
      setChemicalFormula(mineral.chemicalFormula || "")
      setIsVariety(mineral.isVariety)
      setVarietyOf(mineral.varietyOf || null)
      setParentSearch("")
      setDebouncedParentSearch("")
      setParentResults([])
      setSelectedParentName(mineral.varietyOfMineral?.name || "")
    }
  }, [mineral])

  // Debounce parent mineral search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParentSearch(parentSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [parentSearch])

  // Fetch parent mineral results
  useEffect(() => {
    if (!debouncedParentSearch.trim()) {
      setParentResults([])
      return
    }

    let cancelled = false
    setParentSearching(true)

    fetchAdminMinerals({ search: debouncedParentSearch, limit: 10 })
      .then((data) => {
        if (!cancelled) {
          // Exclude the current mineral from results
          setParentResults(
            data.minerals
              .filter((m) => m.id !== mineral?.id && !m.isVariety)
              .map((m) => ({ id: m.id, name: m.name }))
          )
        }
      })
      .finally(() => {
        if (!cancelled) setParentSearching(false)
      })

    return () => { cancelled = true }
  }, [debouncedParentSearch, mineral?.id])

  const mutation = useMutation({
    mutationFn: (input: UpdateMineralInput) => updateMineral(mineral!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-minerals"] })
      onOpenChange(false)
      onSuccess?.()
    },
  })

  const handleSave = useCallback(() => {
    if (!name.trim()) return

    mutation.mutate({
      name: name.trim(),
      chemicalFormula: chemicalFormula.trim() || null,
      isVariety,
      varietyOf: isVariety ? varietyOf : null,
    })
  }, [name, chemicalFormula, isVariety, varietyOf, mutation])

  const selectParent = useCallback((id: string, parentName: string) => {
    setVarietyOf(id)
    setSelectedParentName(parentName)
    setParentSearch("")
    setParentResults([])
  }, [])

  return (
    <Dialog open={!!mineral} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Mineral</DialogTitle>
          <DialogDescription>Update the details for this mineral.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-mineral-name">Name</Label>
            <Input
              id="edit-mineral-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mineral name"
            />
          </div>

          {/* Chemical Formula */}
          <div className="space-y-2">
            <Label htmlFor="edit-mineral-formula">Chemical Formula</Label>
            <Input
              id="edit-mineral-formula"
              value={chemicalFormula}
              onChange={(e) => setChemicalFormula(e.target.value)}
              placeholder="e.g. SiO2"
            />
          </div>

          {/* Is Variety */}
          <div className="flex items-center gap-3">
            <Switch
              id="edit-mineral-variety"
              checked={isVariety}
              onCheckedChange={(checked) => {
                setIsVariety(checked)
                if (!checked) {
                  setVarietyOf(null)
                  setSelectedParentName("")
                  setParentSearch("")
                  setParentResults([])
                }
              }}
            />
            <Label htmlFor="edit-mineral-variety">Is a variety</Label>
          </div>

          {/* Parent Mineral Search */}
          {isVariety && (
            <div className="space-y-2">
              <Label>Parent Mineral</Label>
              {selectedParentName && !parentSearch && (
                <div className="flex items-center gap-2">
                  <span className="text-sm capitalize">{selectedParentName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setVarietyOf(null)
                      setSelectedParentName("")
                    }}
                  >
                    Change
                  </Button>
                </div>
              )}
              {(!selectedParentName || parentSearch) && (
                <>
                  <Input
                    value={parentSearch}
                    onChange={(e) => setParentSearch(e.target.value)}
                    placeholder="Search for parent mineral..."
                  />
                  {parentSearching && (
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  )}
                  {parentResults.length > 0 && (
                    <div className="border border-border rounded-md max-h-40 overflow-y-auto">
                      {parentResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm capitalize hover:bg-muted/50 transition-colors"
                          onClick={() => selectParent(result.id, result.name)}
                        >
                          {result.name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
