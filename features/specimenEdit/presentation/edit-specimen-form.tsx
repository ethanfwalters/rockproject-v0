"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Specimen, UpdateSpecimenInput } from "@/types/specimen"
import type { Mineral } from "@/types/mineral"
import { Button } from "@/features/shared/presentation/button"
import { Label } from "@/features/shared/presentation/label"
import { ImageUpload } from "@/features/shared/presentation/image-upload"
import { MineralMultiSelect } from "@/features/shared/presentation/mineral-multi-select"
import { LocalityPicker } from "@/features/shared/presentation/locality-picker"
import { DimensionsInput } from "@/features/shared/presentation/dimensions-input"
import { X, Save } from "lucide-react"
import { fetchMinerals } from "@/features/shared/application/client/mineralsCrud"

interface EditSpecimenFormProps {
  specimen: Specimen
  onSave: (specimen: UpdateSpecimenInput) => void
  onCancel: () => void
  isSaving: boolean
}

export function EditSpecimenForm({ specimen, onSave, onCancel, isSaving }: EditSpecimenFormProps) {
  const [formData, setFormData] = useState<UpdateSpecimenInput>({
    id: specimen.id,
    imageUrl: specimen.imageUrl || "",
    mineralIds: specimen.mineralIds || [],
    localityId: specimen.localityId,
    length: specimen.length,
    width: specimen.width,
    height: specimen.height,
  })
  const [minerals, setMinerals] = useState<Mineral[]>([])

  // Load minerals on mount
  useEffect(() => {
    fetchMinerals().then(setMinerals).catch(console.error)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const canSave = formData.mineralIds && formData.mineralIds.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit Specimen</h2>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Photo</Label>
          <ImageUpload
            currentImageUrl={formData.imageUrl}
            onImageUrlChange={(url) => setFormData({ ...formData, imageUrl: url || "" })}
            disabled={isSaving}
          />
        </div>

        {/* Minerals */}
        <div className="space-y-2">
          <Label>Minerals (in order of prominence)</Label>
          <MineralMultiSelect
            value={formData.mineralIds || []}
            onChange={(mineralIds) => setFormData({ ...formData, mineralIds })}
            minerals={minerals}
          />
          {(!formData.mineralIds || formData.mineralIds.length === 0) && (
            <p className="text-sm text-destructive">At least one mineral is required</p>
          )}
        </div>

        {/* Locality */}
        <div className="space-y-2">
          <Label>Locality</Label>
          <LocalityPicker
            value={formData.localityId}
            onChange={(localityId) => setFormData({ ...formData, localityId })}
          />
        </div>

        {/* Dimensions */}
        <div className="space-y-2">
          <Label>Dimensions</Label>
          <DimensionsInput
            length={formData.length}
            width={formData.width}
            height={formData.height}
            onChange={(dims) =>
              setFormData({
                ...formData,
                length: dims.length,
                width: dims.width,
                height: dims.height,
              })
            }
          />
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
