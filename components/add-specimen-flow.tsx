"use client"

import { useState } from "react"
import type { Specimen } from "@/types/specimen"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, ChevronRight, ChevronLeft } from "lucide-react"
import { Card } from "@/components/ui/card"

interface AddSpecimenFlowProps {
  onClose: () => void
  onAdd: (specimen: Omit<Specimen, "id" | "dateAdded">) => void
}

type Step = "basics" | "details" | "review"

export function AddSpecimenFlow({ onClose, onAdd }: AddSpecimenFlowProps) {
  const [step, setStep] = useState<Step>("basics")
  const [formData, setFormData] = useState<Partial<Specimen>>({
    type: "mineral",
    details: {},
  })

  const updateField = (field: keyof Specimen, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateDetail = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      details: { ...prev.details, [field]: value },
    }))
  }

  const handleSubmit = () => {
    if (formData.name && formData.type) {
      onAdd(formData as Omit<Specimen, "id" | "dateAdded">)
    }
  }

  const canProceed = formData.name && formData.type

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -right-4 -top-4 rounded-full bg-card p-2 shadow-lg transition-transform hover:scale-110"
        >
          <X className="h-5 w-5" />
        </button>

        <Card className="border-0 bg-card/50 p-8 shadow-2xl backdrop-blur">
          {/* Progress Indicator */}
          <div className="mb-8 flex items-center gap-2">
            <div className={`h-1 flex-1 rounded-full ${step === "basics" ? "bg-primary" : "bg-primary/30"}`} />
            <div className={`h-1 flex-1 rounded-full ${step === "details" ? "bg-primary" : "bg-primary/30"}`} />
            <div className={`h-1 flex-1 rounded-full ${step === "review" ? "bg-primary" : "bg-primary/30"}`} />
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
                  <Input
                    id="name"
                    placeholder="e.g., Amethyst, Trilobite, Granite"
                    value={formData.name || ""}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="mt-2 h-12 text-lg"
                    autoFocus
                  />
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
                  <Label htmlFor="location" className="text-base">
                    Where did you find it?
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Colorado, USA"
                    value={formData.location || ""}
                    onChange={(e) => updateField("location", e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={() => setStep("details")} disabled={!canProceed} className="gap-2">
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Details */}
          {step === "details" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-3xl font-bold text-balance">Add Details</h2>
                <p className="mt-2 text-muted-foreground">Optional but helpful for your records</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-base">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="What makes this specimen special?"
                    value={formData.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="mt-2 min-h-24"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="color" className="text-base">
                      Color
                    </Label>
                    <Input
                      id="color"
                      placeholder="e.g., Purple"
                      value={formData.details?.color || ""}
                      onChange={(e) => updateDetail("color", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hardness" className="text-base">
                      Hardness (Mohs)
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
                      placeholder="e.g., 5cm x 3cm"
                      value={formData.details?.dimensions || ""}
                      onChange={(e) => updateDetail("dimensions", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep("basics")} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleSubmit}>
                    Skip & Add
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
                <h2 className="text-3xl font-bold text-balance">Looking Good!</h2>
                <p className="mt-2 text-muted-foreground">Review your specimen before adding</p>
              </div>

              <div className="space-y-4 rounded-xl bg-muted/50 p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-xl font-semibold">{formData.name}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{formData.type}</p>
                  </div>
                  {formData.location && (
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{formData.location}</p>
                    </div>
                  )}
                </div>
                {formData.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{formData.description}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep("details")} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleSubmit} size="lg" className="gap-2">
                  Add to Collection
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
