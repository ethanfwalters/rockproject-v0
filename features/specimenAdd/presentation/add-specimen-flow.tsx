"use client"

import { useState, useEffect } from "react"
import type { CreateSpecimenInput } from "@/types/specimen"
import type { Mineral } from "@/types/mineral"
import { X } from "lucide-react"
import { Card } from "@/features/shared/presentation/card"
import { fetchMinerals } from "@/features/shared/application/client/mineralsCrud"
import { fetchLocalityWithAncestors } from "@/features/shared/application/client/localitiesCrud"
import { StepImage } from "./step-image"
import { StepMinerals } from "./step-minerals"
import { StepLocality } from "./step-locality"
import { StepDimensions } from "./step-dimensions"
import { StepReview } from "./step-review"

interface AddSpecimenFlowProps {
  onClose: () => void
  onAdd: (specimen: CreateSpecimenInput) => void
}

type Step = "image" | "minerals" | "locality" | "dimensions" | "review"

const STEPS: Step[] = ["image", "minerals", "locality", "dimensions", "review"]

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
  const [selectedMinerals, setSelectedMinerals] = useState<Mineral[]>([])
  const [localityName, setLocalityName] = useState<string>("")

  const currentStepIndex = STEPS.indexOf(step)
  const canProceed = formData.mineralIds && formData.mineralIds.length > 0

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

  const handleSubmit = () => {
    onAdd(formData)
  }

  const updateFormData = <K extends keyof CreateSpecimenInput>(
    key: K,
    value: CreateSpecimenInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

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

          {/* Progress indicator */}
          <div className="mb-8 flex items-center gap-2 pr-12">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= currentStepIndex ? "bg-primary" : "bg-primary/30"
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          {step === "image" && (
            <StepImage
              imageUrl={formData.imageUrl}
              onImageUrlChange={(url) => updateFormData("imageUrl", url || "")}
              onCancel={onClose}
              onNext={() => setStep("minerals")}
            />
          )}

          {step === "minerals" && (
            <StepMinerals
              mineralIds={formData.mineralIds || []}
              minerals={minerals}
              onMineralIdsChange={(ids) => updateFormData("mineralIds", ids)}
              onSelectedMineralsChange={setSelectedMinerals}
              onBack={() => setStep("image")}
              onNext={() => setStep("locality")}
              onSkipToReview={() => setStep("review")}
            />
          )}

          {step === "locality" && (
            <StepLocality
              localityId={formData.localityId}
              onLocalityIdChange={(id) => updateFormData("localityId", id)}
              onBack={() => setStep("minerals")}
              onNext={() => setStep("dimensions")}
              onSkipToReview={() => setStep("review")}
            />
          )}

          {step === "dimensions" && (
            <StepDimensions
              length={formData.length}
              width={formData.width}
              height={formData.height}
              onDimensionsChange={(dims) =>
                setFormData((prev) => ({
                  ...prev,
                  length: dims.length,
                  width: dims.width,
                  height: dims.height,
                }))
              }
              onBack={() => setStep("locality")}
              onNext={() => setStep("review")}
            />
          )}

          {step === "review" && (
            <StepReview
              imageUrl={formData.imageUrl}
              selectedMinerals={selectedMinerals}
              localityName={localityName}
              length={formData.length}
              width={formData.width}
              height={formData.height}
              isPublic={formData.isPublic ?? false}
              canSubmit={!!canProceed}
              onVisibilityChange={(checked) => updateFormData("isPublic", checked)}
              onBack={() => setStep("dimensions")}
              onEdit={() => setStep("image")}
              onSubmit={handleSubmit}
            />
          )}
        </Card>
      </div>
    </div>
  )
}
