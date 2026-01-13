"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/features/shared/presentation/button"
import { Input } from "@/features/shared/presentation/input"
import { Label } from "@/features/shared/presentation/label"
import { Textarea } from "@/features/shared/presentation/textarea"
import { Card } from "@/features/shared/presentation/card"
import { X, Save } from "lucide-react"

export default function EditSpecimenPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    type: "mineral" as "mineral" | "rock" | "fossil",
    hardness: "",
    luster: "",
    composition: "",
    streak: "",
    color: "",
    crystal_system: "",
    cleavage: "",
    fracture: "",
    specific_gravity: "",
    description: "",
    common_locations: "",
  })

  useEffect(() => {
    fetchSpecimen()
  }, [params.id])

  async function fetchSpecimen() {
    try {
      const response = await fetch(`/api/admin/specimens/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch specimen")

      const data = await response.json()
      const spec = data.specimen

      setFormData({
        name: spec.name || "",
        type: spec.type || "mineral",
        hardness: spec.hardness || "",
        luster: spec.luster || "",
        composition: spec.composition || "",
        streak: spec.streak || "",
        color: spec.color || "",
        crystal_system: spec.crystal_system || "",
        cleavage: spec.cleavage || "",
        fracture: spec.fracture || "",
        specific_gravity: spec.specific_gravity || "",
        description: spec.description || "",
        common_locations: spec.common_locations ? spec.common_locations.join(", ") : "",
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const submitData = {
        ...formData,
        common_locations: formData.common_locations
          ? formData.common_locations.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
      }

      const response = await fetch(`/api/admin/specimens/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update specimen")
      }

      router.push("/admin/specimens")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

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
          <h1 className="text-3xl font-bold">Edit Specimen</h1>
          <p className="text-muted-foreground mt-2">Update specimen information</p>
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onClick={() => setFormData({ ...formData, type })}
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
                onChange={(e) => setFormData({ ...formData, hardness: e.target.value })}
                placeholder="e.g., 7, 6-6.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="luster">Luster</Label>
              <Input
                id="luster"
                value={formData.luster}
                onChange={(e) => setFormData({ ...formData, luster: e.target.value })}
                placeholder="e.g., Vitreous, Metallic"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="streak">Streak</Label>
              <Input
                id="streak"
                value={formData.streak}
                onChange={(e) => setFormData({ ...formData, streak: e.target.value })}
                placeholder="e.g., White, Greenish-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                placeholder="e.g., SiO₂, CaCO₃"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crystal_system">Crystal System</Label>
              <Input
                id="crystal_system"
                value={formData.crystal_system}
                onChange={(e) => setFormData({ ...formData, crystal_system: e.target.value })}
                placeholder="e.g., Hexagonal, Cubic"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specific_gravity">Specific Gravity</Label>
              <Input
                id="specific_gravity"
                value={formData.specific_gravity}
                onChange={(e) => setFormData({ ...formData, specific_gravity: e.target.value })}
                placeholder="e.g., 2.65"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cleavage">Cleavage</Label>
              <Input
                id="cleavage"
                value={formData.cleavage}
                onChange={(e) => setFormData({ ...formData, cleavage: e.target.value })}
                placeholder="e.g., Perfect, None"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fracture">Fracture</Label>
              <Input
                id="fracture"
                value={formData.fracture}
                onChange={(e) => setFormData({ ...formData, fracture: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the specimen..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="common_locations">Common Locations (comma-separated)</Label>
            <Input
              id="common_locations"
              value={formData.common_locations}
              onChange={(e) => setFormData({ ...formData, common_locations: e.target.value })}
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
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
