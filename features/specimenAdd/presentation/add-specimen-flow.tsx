"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Specimen } from "@/types/specimen"
import { Button } from "@/features/shared/presentation/button"
import { Input } from "@/features/shared/presentation/input"
import { Label } from "@/features/shared/presentation/label"
import { Textarea } from "@/features/shared/presentation/textarea"
import { X, ChevronRight, ChevronLeft, MapPin, Tag, Plus, Globe, Sparkles, Loader2, Image as ImageIcon } from "lucide-react"
import { Card } from "@/features/shared/presentation/card"
import { ImageUpload } from "@/features/shared/presentation/image-upload"

interface AddSpecimenFlowProps {
  onClose: () => void
  onAdd: (specimen: Omit<Specimen, "id" | "dateAdded">) => void
}

type Step = "basics" | "image" | "location" | "tags" | "details" | "review"

export function AddSpecimenFlow({ onClose, onAdd }: AddSpecimenFlowProps) {
  const [step, setStep] = useState<Step>("basics")
  const [formData, setFormData] = useState<Partial<Specimen>>({
    type: "mineral",
    details: {},
    tags: [],
    imageUrl: "",
  })
  const [coordinates, setCoordinates] = useState<{ lat: string; lng: string }>({ lat: "", lng: "" })
  const [tagInput, setTagInput] = useState("")
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)

  const updateField = (field: keyof Specimen, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateDetail = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      details: { ...prev.details, [field]: value },
    }))
  }

  useEffect(() => {
    const lookupSpecimen = async () => {
      if (!formData.name || formData.name.length < 2) {
        setAutoFilled(false)
        return
      }

      setIsLookingUp(true)
      try {
        const response = await fetch(`/api/specimen-lookup?name=${encodeURIComponent(formData.name)}`)
        const result = await response.json()

        if (result.found && result.data) {
          const { hardness, luster, composition, streak, type } = result.data

          setFormData((prev) => ({
            ...prev,
            // Auto-set type if found and user hasn't changed it
            ...(type && { type }),
            details: {
              ...prev.details,
              ...(hardness && { hardness }),
              ...(luster && { luster }),
              ...(composition && { composition }),
              ...(streak && { streak }),
            },
          }))
          setAutoFilled(true)
        } else {
          setAutoFilled(false)
        }
      } catch (error) {
        console.error("Failed to lookup specimen:", error)
        setAutoFilled(false)
      } finally {
        setIsLookingUp(false)
      }
    }

    // Debounce the lookup
    const timeoutId = setTimeout(lookupSpecimen, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.name])

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !formData.tags?.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tagToRemove),
    }))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const suggestedTags = [
    "rare",
    "gift",
    "purchased",
    "found",
    "trade",
    "favorite",
    "museum-quality",
    "needs-id",
    "polished",
    "raw",
    "display",
    "study",
  ]

  const handleSubmit = () => {
    if (formData.name && formData.type) {
      const specimenData: Omit<Specimen, "id" | "dateAdded"> = {
        ...formData,
        type: formData.type,
        name: formData.name,
      }

      if (coordinates.lat && coordinates.lng) {
        specimenData.coordinates = {
          lat: Number.parseFloat(coordinates.lat),
          lng: Number.parseFloat(coordinates.lng),
        }
      }

      onAdd(specimenData)
    }
  }

  const canProceed = formData.name && formData.type

  const steps: Step[] = ["basics", "image", "location", "tags", "details", "review"]
  const currentStepIndex = steps.indexOf(step)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300 mx-4">
        <Card className="border-0 bg-card/50 p-8 shadow-2xl backdrop-blur relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-muted p-2 transition-all hover:bg-muted/80 hover:scale-110 z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-8 flex items-center gap-2 pr-12">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= currentStepIndex ? "bg-primary" : "bg-primary/30"
                }`}
              />
            ))}
          </div>

          {/* Step: Basics */}
          {step === "basics" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-3xl font-bold text-balance">Add a Specimen</h2>
                <p className="mt-2 text-muted-foreground">Let's start with the basics</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-base">
                    What is it?
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="e.g., Amethyst, Trilobite, Granite"
                      value={formData.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="mt-2 h-12 text-lg pr-10"
                      autoFocus
                    />
                    {isLookingUp && (
                      <div className="absolute right-3 top-1/2 mt-1 -translate-y-1/2">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {autoFilled && !isLookingUp && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-primary">
                      <Sparkles className="h-4 w-4" />
                      <span>Details auto-filled! You can review them in the Details step.</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-base">Type</Label>
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    {(["mineral", "rock", "fossil"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => updateField("type", type)}
                        className={`rounded-xl border-2 p-4 text-center capitalize transition-all ${
                          formData.type === type
                            ? "border-primary bg-primary/10 font-semibold"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-base">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="What makes this specimen special?"
                    value={formData.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="mt-2 min-h-20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={() => setStep("image")} disabled={!canProceed} className="gap-2">
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Image */}
          {step === "image" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-balance">Add a Photo</h2>
                    <p className="mt-1 text-muted-foreground">Show off your specimen (optional)</p>
                  </div>
                </div>
              </div>

              <ImageUpload
                currentImageUrl={formData.imageUrl}
                onImageUrlChange={(url) => updateField("imageUrl", url || "")}
              />

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep("basics")} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("review")}>
                    Finish
                  </Button>
                  <Button onClick={() => setStep("location")} className="gap-2">
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === "location" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-balance">Where's it from?</h2>
                    <p className="mt-1 text-muted-foreground">Help map your collection</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="location" className="text-base">
                    Location Name
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Crystal Peak, Colorado, USA"
                    value={formData.location || ""}
                    onChange={(e) => updateField("location", e.target.value)}
                    className="mt-2 h-12"
                    autoFocus
                  />
                  <p className="mt-1.5 text-sm text-muted-foreground">Where was this specimen found or acquired?</p>
                </div>

                <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">GPS Coordinates</Label>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                      Optional
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Add coordinates to see this specimen on your collection map
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="lat" className="text-sm text-muted-foreground">
                        Latitude
                      </Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        placeholder="e.g., 39.7392"
                        value={coordinates.lat}
                        onChange={(e) => setCoordinates((prev) => ({ ...prev, lat: e.target.value }))}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng" className="text-sm text-muted-foreground">
                        Longitude
                      </Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        placeholder="e.g., -104.9903"
                        value={coordinates.lng}
                        onChange={(e) => setCoordinates((prev) => ({ ...prev, lng: e.target.value }))}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Tip: You can find coordinates on Google Maps by right-clicking a location
                  </p>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep("image")} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("review")}>
                    Finish
                  </Button>
                  <Button onClick={() => setStep("tags")} className="gap-2">
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === "tags" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Tag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-balance">Add Tags</h2>
                    <p className="mt-1 text-muted-foreground">Organize and categorize your specimen</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="tagInput" className="text-base">
                    Custom Tags
                  </Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="tagInput"
                      placeholder="Type a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="h-11"
                      autoFocus
                    />
                    <Button
                      onClick={addTag}
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 shrink-0 bg-transparent"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Current tags */}
                {formData.tags && formData.tags.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Your Tags</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => removeTag(tag)}
                          className="group flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-all hover:bg-destructive"
                        >
                          {tag}
                          <X className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested tags */}
                <div>
                  <Label className="text-sm text-muted-foreground">Suggested Tags</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {suggestedTags
                      .filter((tag) => !formData.tags?.includes(tag))
                      .map((tag) => (
                        <button
                          key={tag}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              tags: [...(prev.tags || []), tag],
                            }))
                          }
                          className="rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-all hover:border-primary hover:bg-primary/10"
                        >
                          + {tag}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep("location")} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("review")}>
                    Finish
                  </Button>
                  <Button onClick={() => setStep("details")} className="gap-2">
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step: Details */}
          {step === "details" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-3xl font-bold text-balance">Technical Details</h2>
                <p className="mt-2 text-muted-foreground">For the geology enthusiasts</p>
                {autoFilled && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span>Some fields were auto-filled based on "{formData.name}". Feel free to edit!</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="color" className="text-base">
                      Color
                    </Label>
                    <Input
                      id="color"
                      placeholder="e.g., Purple, Banded"
                      value={formData.details?.color || ""}
                      onChange={(e) => updateDetail("color", e.target.value)}
                      className="mt-2"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label htmlFor="hardness" className="text-base flex items-center gap-2">
                      Hardness (Mohs)
                      {autoFilled && formData.details?.hardness && <Sparkles className="h-3 w-3 text-primary" />}
                    </Label>
                    <Input
                      id="hardness"
                      placeholder="e.g., 7"
                      value={formData.details?.hardness || ""}
                      onChange={(e) => updateDetail("hardness", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight" className="text-base">
                      Weight
                    </Label>
                    <Input
                      id="weight"
                      placeholder="e.g., 250g"
                      value={formData.details?.weight || ""}
                      onChange={(e) => updateDetail("weight", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dimensions" className="text-base">
                      Dimensions
                    </Label>
                    <Input
                      id="dimensions"
                      placeholder="e.g., 5cm x 3cm x 2cm"
                      value={formData.details?.dimensions || ""}
                      onChange={(e) => updateDetail("dimensions", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="luster" className="text-base flex items-center gap-2">
                      Luster
                      {autoFilled && formData.details?.luster && <Sparkles className="h-3 w-3 text-primary" />}
                    </Label>
                    <Input
                      id="luster"
                      placeholder="e.g., Vitreous, Waxy"
                      value={formData.details?.luster || ""}
                      onChange={(e) => updateDetail("luster", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="streak" className="text-base flex items-center gap-2">
                      Streak
                      {autoFilled && formData.details?.streak && <Sparkles className="h-3 w-3 text-primary" />}
                    </Label>
                    <Input
                      id="streak"
                      placeholder="e.g., White"
                      value={formData.details?.streak || ""}
                      onChange={(e) => updateDetail("streak", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="composition" className="text-base flex items-center gap-2">
                    Chemical Composition
                    {autoFilled && formData.details?.composition && <Sparkles className="h-3 w-3 text-primary" />}
                  </Label>
                  <Input
                    id="composition"
                    placeholder="e.g., SiO₂"
                    value={formData.details?.composition || ""}
                    onChange={(e) => updateDetail("composition", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="text-base">
                    Age / Period
                  </Label>
                  <Input
                    id="age"
                    placeholder="e.g., Jurassic, 150 million years"
                    value={formData.details?.age || ""}
                    onChange={(e) => updateDetail("age", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep("tags")} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("review")}>
                    Finish
                  </Button>
                  <Button onClick={() => setStep("review")} className="gap-2">
                    Review
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {step === "review" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-3xl font-bold text-balance">Review & Add</h2>
                <p className="mt-2 text-muted-foreground">Make sure everything looks good</p>
              </div>

              <div className="space-y-4 rounded-xl border border-border bg-card/50 p-5">
                {formData.imageUrl && (
                  <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
                    <img src={formData.imageUrl} alt={formData.name} className="h-full w-full object-cover" />
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{formData.name}</h3>
                    <p className="mt-1 text-sm capitalize text-muted-foreground">{formData.type}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep("basics")}>
                    Edit
                  </Button>
                </div>

                {formData.description && <p className="text-sm text-muted-foreground">{formData.description}</p>}

                {formData.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{formData.location}</span>
                    {coordinates.lat && coordinates.lng && (
                      <span className="text-muted-foreground">
                        ({coordinates.lat}, {coordinates.lng})
                      </span>
                    )}
                  </div>
                )}

                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {formData.details && Object.keys(formData.details).length > 0 && (
                  <div className="grid grid-cols-2 gap-2 border-t border-border pt-4 text-sm">
                    {Object.entries(formData.details).map(([key, value]) =>
                      value ? (
                        <div key={key}>
                          <span className="text-muted-foreground capitalize">{key}:</span>{" "}
                          <span className="font-medium">{value}</span>
                        </div>
                      ) : null,
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep("details")} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleSubmit} className="gap-2">
                  Add to Collection
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
