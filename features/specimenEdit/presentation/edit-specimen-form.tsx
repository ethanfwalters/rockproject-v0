"use client"

import type React from "react"

import { useState } from "react"
import type { Specimen } from "@/types/specimen"
import { Button } from "@/features/shared/presentation/button"
import { Input } from "@/features/shared/presentation/input"
import { Label } from "@/features/shared/presentation/label"
import { Textarea } from "@/features/shared/presentation/textarea"
import { Card } from "@/features/shared/presentation/card"
import { X, Save, ChevronDown, ChevronUp, Tag, Plus } from "lucide-react"

const SUGGESTED_TAGS = [
  "rare",
  "common",
  "gift",
  "purchased",
  "found",
  "traded",
  "museum-quality",
  "display",
  "raw",
  "polished",
  "crystal",
  "cluster",
  "single",
  "large",
  "small",
  "colorful",
  "unique",
]

interface EditSpecimenFormProps {
  specimen: Specimen
  onSave: (specimen: Specimen) => void
  onCancel: () => void
  isSaving: boolean
}

export function EditSpecimenForm({ specimen, onSave, onCancel, isSaving }: EditSpecimenFormProps) {
  const [formData, setFormData] = useState({
    name: specimen.name,
    type: specimen.type,
    location: specimen.location || "",
    description: specimen.description || "",
    imageUrl: specimen.imageUrl || "",
    dateAdded: specimen.dateAdded,
    coordinates: specimen.coordinates || { lat: 0, lng: 0 },
    tags: specimen.tags || [],
    details: {
      hardness: specimen.details?.hardness || "",
      composition: specimen.details?.composition || "",
      color: specimen.details?.color || "",
      luster: specimen.details?.luster || "",
      weight: specimen.details?.weight || "",
      dimensions: specimen.details?.dimensions || "",
    },
  })
  const [showDetails, setShowDetails] = useState(false)
  const [customTag, setCustomTag] = useState("")

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim()
    if (normalizedTag && !formData.tags.includes(normalizedTag)) {
      setFormData({ ...formData, tags: [...formData.tags, normalizedTag] })
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  const handleAddCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag)
      setCustomTag("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...specimen,
      ...formData,
      coordinates: formData.coordinates.lat && formData.coordinates.lng ? formData.coordinates : undefined,
    })
  }

  const typeOptions = ["mineral", "rock", "fossil"] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit Specimen</h2>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <div className="flex gap-2">
            {typeOptions.map((type) => (
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

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Where was this found?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tell the story of this specimen..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateAdded">Acquisition Date</Label>
          <Input
            id="dateAdded"
            type="date"
            value={formData.dateAdded}
            onChange={(e) => setFormData({ ...formData, dateAdded: e.target.value })}
          />
        </div>

        <Card className="border-0 bg-muted/50 p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Tags</Label>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Add custom tag..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddCustomTag()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddCustomTag}
                disabled={!customTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Suggested tags</span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.filter((tag) => !formData.tags.includes(tag))
                  .slice(0, 12)
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="rounded-full border border-border bg-background px-2.5 py-1 text-xs transition-colors hover:bg-muted"
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.coordinates.lat || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  coordinates: { ...formData.coordinates, lat: Number.parseFloat(e.target.value) || 0 },
                })
              }
              placeholder="-90 to 90"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.coordinates.lng || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  coordinates: { ...formData.coordinates, lng: Number.parseFloat(e.target.value) || 0 },
                })
              }
              placeholder="-180 to 180"
            />
          </div>
        </div>

        <Card className="border-0 bg-muted/50">
          <button
            type="button"
            className="flex w-full items-center justify-between p-4"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span className="font-medium">Additional Details</span>
            {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {showDetails && (
            <div className="space-y-4 p-4 pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hardness">Hardness (Mohs)</Label>
                  <Input
                    id="hardness"
                    value={formData.details.hardness}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, hardness: e.target.value },
                      })
                    }
                    placeholder="1-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.details.color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, color: e.target.value },
                      })
                    }
                    placeholder="e.g. Purple"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="luster">Luster</Label>
                  <Input
                    id="luster"
                    value={formData.details.luster}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, luster: e.target.value },
                      })
                    }
                    placeholder="e.g. Vitreous"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (g)</Label>
                  <Input
                    id="weight"
                    value={formData.details.weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, weight: e.target.value },
                      })
                    }
                    placeholder="e.g. 150"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="composition">Composition</Label>
                <Input
                  id="composition"
                  value={formData.details.composition}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      details: { ...formData.details, composition: e.target.value },
                    })
                  }
                  placeholder="e.g. SiO₂"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={formData.details.dimensions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      details: { ...formData.details, dimensions: e.target.value },
                    })
                  }
                  placeholder="e.g. 5cm x 3cm x 2cm"
                />
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving || !formData.name} className="flex-1 gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
