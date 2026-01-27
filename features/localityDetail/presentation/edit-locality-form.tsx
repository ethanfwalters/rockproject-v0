"use client"

import type React from "react"
import { useState } from "react"
import type { LocalityWithAncestors, CreateLocalityInput } from "@/types/locality"
import { Button } from "@/features/shared/presentation/button"
import { Input } from "@/features/shared/presentation/input"
import { Label } from "@/features/shared/presentation/label"
import { X, Save } from "lucide-react"

const SUGGESTED_KINDS = [
  "country",
  "state",
  "province",
  "county",
  "district",
  "city",
  "region",
  "mine",
  "quarry",
  "deposit",
]

interface EditLocalityFormProps {
  locality: LocalityWithAncestors
  onSave: (data: Partial<CreateLocalityInput>) => void
  onCancel: () => void
  isSaving: boolean
}

export function EditLocalityForm({ locality, onSave, onCancel, isSaving }: EditLocalityFormProps) {
  const [formData, setFormData] = useState({
    name: locality.name,
    kind: locality.kind,
    latitude: locality.latitude ?? "",
    longitude: locality.longitude ?? "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name.trim(),
      kind: formData.kind.trim(),
      latitude: formData.latitude === "" ? undefined : Number(formData.latitude),
      longitude: formData.longitude === "" ? undefined : Number(formData.longitude),
    })
  }

  const canSave = formData.name.trim() !== "" && formData.kind.trim() !== ""

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit Locality</h2>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter locality name"
            disabled={isSaving}
          />
          {formData.name.trim() === "" && (
            <p className="text-sm text-destructive">Name is required</p>
          )}
        </div>

        {/* Kind */}
        <div className="space-y-2">
          <Label htmlFor="kind">Type</Label>
          <Input
            id="kind"
            value={formData.kind}
            onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
            placeholder="e.g., mine, quarry, district"
            disabled={isSaving}
            list="kind-suggestions"
          />
          <datalist id="kind-suggestions">
            {SUGGESTED_KINDS.map((kind) => (
              <option key={kind} value={kind} />
            ))}
          </datalist>
          {formData.kind.trim() === "" && (
            <p className="text-sm text-destructive">Type is required</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {SUGGESTED_KINDS.slice(0, 6).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setFormData({ ...formData, kind })}
                className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                  formData.kind === kind
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 hover:bg-muted border-transparent"
                }`}
              >
                {kind}
              </button>
            ))}
          </div>
        </div>

        {/* Coordinates */}
        <div className="space-y-2">
          <Label>Coordinates (optional)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="latitude" className="text-xs text-muted-foreground">
                Latitude
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="-90 to 90"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="longitude" className="text-xs text-muted-foreground">
                Longitude
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="-180 to 180"
                disabled={isSaving}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter decimal coordinates (e.g., 39.7392, -104.9903)
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving || !canSave} className="flex-1 gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
