"use client"

import { ChevronRight, ChevronLeft, Ruler } from "lucide-react"
import { Button } from "@/features/shared/presentation/button"
import { DimensionsInput } from "@/features/shared/presentation/dimensions-input"

interface StepDimensionsProps {
  length?: number
  width?: number
  height?: number
  onDimensionsChange: (dims: { length?: number; width?: number; height?: number }) => void
  onBack: () => void
  onNext: () => void
}

export function StepDimensions({
  length,
  width,
  height,
  onDimensionsChange,
  onBack,
  onNext,
}: StepDimensionsProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Ruler className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-balance">Dimensions</h2>
            <p className="mt-1 text-muted-foreground">How big is your specimen? (optional)</p>
          </div>
        </div>
      </div>

      <DimensionsInput length={length} width={width} height={height} onChange={onDimensionsChange} />

      <div className="flex justify-between gap-3 pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} className="gap-2">
          Review
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
