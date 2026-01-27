"use client"

import { ChevronRight, ChevronLeft, Gem } from "lucide-react"
import type { Mineral } from "@/types/mineral"
import { Button } from "@/features/shared/presentation/button"
import { MineralMultiSelect } from "@/features/shared/presentation/mineral-multi-select"

interface StepMineralsProps {
  mineralIds: string[]
  minerals: Mineral[]
  onMineralIdsChange: (ids: string[]) => void
  onSelectedMineralsChange: (minerals: Mineral[]) => void
  onBack: () => void
  onNext: () => void
  onSkipToReview: () => void
}

export function StepMinerals({
  mineralIds,
  minerals,
  onMineralIdsChange,
  onSelectedMineralsChange,
  onBack,
  onNext,
  onSkipToReview,
}: StepMineralsProps) {
  const canProceed = mineralIds.length > 0

  return (
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
        value={mineralIds}
        onChange={onMineralIdsChange}
        onSelectedMineralsChange={onSelectedMineralsChange}
        minerals={minerals}
      />

      {mineralIds.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Search and select at least one mineral to continue
        </p>
      )}

      <div className="flex justify-between gap-3 pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onSkipToReview} disabled={!canProceed}>
            Skip to Review
          </Button>
          <Button onClick={onNext} disabled={!canProceed} className="gap-2">
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
