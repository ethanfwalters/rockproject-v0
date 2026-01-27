"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { Card } from "@/features/shared/presentation/card"
import { useAddSpecimenFlow } from "../application/hooks/useAddSpecimenFlow"
import { StepImage } from "./step-image"
import { StepMinerals } from "./step-minerals"
import { StepLocality } from "./step-locality"
import { StepDimensions } from "./step-dimensions"
import { StepReview } from "./step-review"
import { STEPS, type AddSpecimenFlowProps } from "../domain/types"

export function AddSpecimenFlow({ onClose, onAdd }: AddSpecimenFlowProps) {
  const {
    step,
    formData,
    minerals,
    selectedMinerals,
    localityName,
    currentStepIndex,
    canProceed,
    setStep,
    updateFormData,
    updateDimensions,
    setSelectedMinerals,
  } = useAddSpecimenFlow()

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const handleSubmit = () => {
    onAdd(formData)
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
              onDimensionsChange={updateDimensions}
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
