"use client"

import { ChevronRight, ChevronLeft, MapPin } from "lucide-react"
import { Button } from "@/features/shared/presentation/button"
import { LocalityPicker } from "@/features/shared/presentation/locality-picker"

interface StepLocalityProps {
  localityId: string | undefined
  onLocalityIdChange: (id: string | undefined) => void
  onBack: () => void
  onNext: () => void
  onSkipToReview: () => void
}

export function StepLocality({
  localityId,
  onLocalityIdChange,
  onBack,
  onNext,
  onSkipToReview,
}: StepLocalityProps) {
  return (
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

      <LocalityPicker value={localityId} onChange={onLocalityIdChange} />

      <p className="text-sm text-muted-foreground">
        Start by selecting a country, then drill down to more specific locations. You can add new
        localities at any level.
      </p>

      <div className="flex justify-between gap-3 pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onSkipToReview}>
            Skip to Review
          </Button>
          <Button onClick={onNext} className="gap-2">
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
