"use client"

import { useState, useEffect } from "react"
import type { CreateSpecimenInput } from "@/types/specimen"
import type { Mineral } from "@/types/mineral"
import { Button } from "@/features/shared/presentation/button"
import { Switch } from "@/features/shared/presentation/switch"
import { X, ChevronRight, ChevronLeft, MapPin, Image as ImageIcon, Gem, Ruler, Globe, Lock } from "lucide-react"
import { Card } from "@/features/shared/presentation/card"
import { ImageUpload } from "@/features/shared/presentation/image-upload"
import { MineralMultiSelect } from "@/features/shared/presentation/mineral-multi-select"
import { LocalityPicker } from "@/features/shared/presentation/locality-picker"
import { DimensionsInput, formatDimensions } from "@/features/shared/presentation/dimensions-input"
import { fetchMinerals } from "@/features/shared/application/client/mineralsCrud"
import { fetchLocalityWithAncestors } from "@/features/shared/application/client/localitiesCrud"

interface AddSpecimenFlowProps {
  onClose: () => void
  onAdd: (specimen: CreateSpecimenInput) => void
}

type Step = "image" | "minerals" | "locality" | "dimensions" | "review"

export function AddSpecimenFlow({ onClose, onAdd }: AddSpecimenFlowProps) {
  const [step, setStep] = useState<Step>("image")
  const [formData, setFormData] = useState<CreateSpecimenInput>({
    imageUrl: "",
    mineralIds: [],
    localityId: undefined,
    length: undefined,
    width: undefined,
    height: undefined,
    isPublic: false,
  })
  const [minerals, setMinerals] = useState<Mineral[]>([])
  const [localityName, setLocalityName] = useState<string>("")

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  // Load minerals on mount
  useEffect(() => {
    fetchMinerals().then(setMinerals).catch(console.error)
  }, [])

  // Fetch locality name when localityId changes
  useEffect(() => {
    if (formData.localityId) {
      fetchLocalityWithAncestors(formData.localityId)
        .then((loc) => setLocalityName(loc.fullPath))
        .catch(console.error)
    } else {
      setLocalityName("")
    }
  }, [formData.localityId])

  const selectedMinerals = formData.mineralIds
    ?.map((id) => minerals.find((m) => m.id === id))
    .filter((m): m is Mineral => m !== undefined) || []

  const handleSubmit = () => {
    onAdd(formData)
  }

  const canProceed = formData.mineralIds && formData.mineralIds.length > 0

  const steps: Step[] = ["image", "minerals", "locality", "dimensions", "review"]
  const currentStepIndex = steps.indexOf(step)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/95 backdrop-blur-sm overflow-y-auto py-4 sm:py-8">
      <div className="relative w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300 mx-4 my-auto">
        <Card className="border-0 bg-card/50 p-4 sm:p-8 shadow-2xl backdrop-blur relative">
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
                onImageUrlChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url || "" }))}
              />

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={() => setStep("minerals")} className="gap-2">
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Minerals */}
          {step === "minerals" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Gem className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-balance">What minerals?</h2>
                    <p className="mt-1 text-muted-foreground">
                      Select minerals in order of prominence (primary first)
                    </p>
                  </div>
                </div>
              </div>

              <MineralMultiSelect
                value={formData.mineralIds || []}
                onChange={(mineralIds) => setFormData((prev) => ({ ...prev, mineralIds }))}
                minerals={minerals}
              />

              {formData.mineralIds?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Search and select at least one mineral to continue
                </p>
              )}

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep("image")} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("review")} disabled={!canProceed}>
                    Skip to Review
                  </Button>
                  <Button onClick={() => setStep("locality")} disabled={!canProceed} className="gap-2">
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step: Locality */}
          {step === "locality" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-balance">Where's it from?</h2>
                    <p className="mt-1 text-muted-foreground">
                      Select the locality where this specimen was found
                    </p>
                  </div>
                </div>
              </div>

              <LocalityPicker
                value={formData.localityId}
                onChange={(localityId) => setFormData((prev) => ({ ...prev, localityId }))}
              />

              <p className="text-sm text-muted-foreground">
                Start by selecting a country, then drill down to more specific locations. You can
                add new localities at any level.
              </p>

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep("minerals")} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("review")}>
                    Skip to Review
                  </Button>
                  <Button onClick={() => setStep("dimensions")} className="gap-2">
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step: Dimensions */}
          {step === "dimensions" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Ruler className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-balance">Dimensions</h2>
                    <p className="mt-1 text-muted-foreground">
                      How big is your specimen? (optional)
                    </p>
                  </div>
                </div>
              </div>

              <DimensionsInput
                length={formData.length}
                width={formData.width}
                height={formData.height}
                onChange={(dims) =>
                  setFormData((prev) => ({
                    ...prev,
                    length: dims.length,
                    width: dims.width,
                    height: dims.height,
                  }))
                }
              />

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep("locality")} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setStep("review")} className="gap-2">
                  Review
                  <ChevronRight className="h-4 w-4" />
                </Button>
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
                    <img
                      src={formData.imageUrl}
                      alt="Specimen"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Minerals */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Minerals</h3>
                  {selectedMinerals.length > 0 ? (
                    <div className="space-y-1">
                      {selectedMinerals.map((mineral, index) => (
                        <div key={mineral.id} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-16">
                            {index === 0 ? "Primary" : index === 1 ? "Secondary" : `${index + 1}th`}
                          </span>
                          <span className="font-medium">{mineral.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No minerals selected</p>
                  )}
                </div>

                {/* Locality */}
                {localityName && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Locality</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{localityName}</span>
                    </div>
                  </div>
                )}

                {/* Dimensions */}
                {formatDimensions(formData.length, formData.width, formData.height) && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Dimensions</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDimensions(formData.length, formData.width, formData.height)}</span>
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("image")}
                  className="mt-2"
                >
                  Edit
                </Button>
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  {formData.isPublic ? (
                    <Globe className="h-5 w-5 text-primary" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">
                      {formData.isPublic ? "Public" : "Private"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.isPublic
                        ? "Other users can see this specimen"
                        : "Only you can see this specimen"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.isPublic ?? false}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked }))}
                />
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep("dimensions")} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={!canProceed} className="gap-2">
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
