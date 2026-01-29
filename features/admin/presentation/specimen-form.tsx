"use client"

import Link from "next/link"
import { Button } from "@/features/shared/presentation/button"
import { Input } from "@/features/shared/presentation/input"
import { Label } from "@/features/shared/presentation/label"
import { Textarea } from "@/features/shared/presentation/textarea"
import { Card } from "@/features/shared/presentation/card"
import { X, Save } from "lucide-react"
import { useSpecimenForm } from "@/features/admin/application/hooks/useSpecimenForm"
import type { SpecimenFormProps } from "@/features/admin/domain/types"

export function SpecimenForm({ specimenId }: SpecimenFormProps) {
  const {
    isEditMode,
    loading,
    saving,
    error,
    formData,
    handleSubmit,
    updateField,
  } = useSpecimenForm(specimenId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading specimen...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/specimens">
          <Button variant="ghost" className="gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{isEditMode ? "Edit Specimen" : "Add New Specimen"}</h1>
          <p className="text-muted-foreground mt-2">
            {isEditMode ? "Update specimen information" : "Add a new specimen to the reference database"}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., quartz, granite, trilobite"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                Type <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                {(["mineral", "rock", "fossil"] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.type === type ? "default" : "outline"}
                    className="flex-1 capitalize"
                    onClick={() => updateField("type", type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Physical Properties */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Physical Properties</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hardness">Hardness (Mohs Scale)</Label>
              <Input
                id="hardness"
                value={formData.hardness}
                onChange={(e) => updateField("hardness", e.target.value)}
                placeholder="e.g., 7, 6-6.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="luster">Luster</Label>
              <Input
                id="luster"
                value={formData.luster}
                onChange={(e) => updateField("luster", e.target.value)}
                placeholder="e.g., Vitreous, Metallic"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="streak">Streak</Label>
              <Input
                id="streak"
                value={formData.streak}
                onChange={(e) => updateField("streak", e.target.value)}
                placeholder="e.g., White, Greenish-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => updateField("color", e.target.value)}
                placeholder="e.g., Purple, Clear, Gray"
              />
            </div>
          </div>
        </Card>

        {/* Chemical & Structural */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Chemical & Structural Properties</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="composition">Chemical Composition</Label>
              <Input
                id="composition"
                value={formData.composition}
                onChange={(e) => updateField("composition", e.target.value)}
                placeholder="e.g., SiO₂, CaCO₃"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crystal_system">Crystal System</Label>
              <Input
                id="crystal_system"
                value={formData.crystal_system}
                onChange={(e) => updateField("crystal_system", e.target.value)}
                placeholder="e.g., Hexagonal, Cubic"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specific_gravity">Specific Gravity</Label>
              <Input
                id="specific_gravity"
                value={formData.specific_gravity}
                onChange={(e) => updateField("specific_gravity", e.target.value)}
                placeholder="e.g., 2.65"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cleavage">Cleavage</Label>
              <Input
                id="cleavage"
                value={formData.cleavage}
                onChange={(e) => updateField("cleavage", e.target.value)}
                placeholder="e.g., Perfect, None"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fracture">Fracture</Label>
              <Input
                id="fracture"
                value={formData.fracture}
                onChange={(e) => updateField("fracture", e.target.value)}
                placeholder="e.g., Conchoidal, Uneven"
              />
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Additional Information</h2>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Brief description of the specimen..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="common_locations">Common Locations (comma-separated)</Label>
            <Input
              id="common_locations"
              value={formData.common_locations}
              onChange={(e) => updateField("common_locations", e.target.value)}
              placeholder="e.g., Brazil, Madagascar, Colorado"
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/admin/specimens" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving || !formData.name} className="flex-1 gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : isEditMode ? "Save Changes" : "Save Specimen"}
          </Button>
        </div>
      </form>
    </div>
  )
}
