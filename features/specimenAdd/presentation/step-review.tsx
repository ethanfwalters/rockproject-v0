"use client"

import { ChevronRight, ChevronLeft, MapPin, Ruler, Globe, Lock } from "lucide-react"
import type { Mineral } from "@/types/mineral"
import { Button } from "@/features/shared/presentation/button"
import { Switch } from "@/features/shared/presentation/switch"
import { formatDimensions } from "@/features/shared/presentation/dimensions-input"

interface StepReviewProps {
  imageUrl: string | undefined
  selectedMinerals: Mineral[]
  localityName: string
  length: number | undefined
  width: number | undefined
  height: number | undefined
  isPublic: boolean
  canSubmit: boolean
  onVisibilityChange: (isPublic: boolean) => void
  onBack: () => void
  onEdit: () => void
  onSubmit: () => void
}

export function StepReview({
  imageUrl,
  selectedMinerals,
  localityName,
  length,
  width,
  height,
  isPublic,
  canSubmit,
  onVisibilityChange,
  onBack,
  onEdit,
  onSubmit,
}: StepReviewProps) {
  const dimensionsText = formatDimensions(length, width, height)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-3xl font-bold text-balance">Review & Add</h2>
        <p className="mt-2 text-muted-foreground">Make sure everything looks good</p>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card/50 p-5">
        {imageUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
            <img src={imageUrl} alt="Specimen" className="h-full w-full object-cover" />
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
        {dimensionsText && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Dimensions</h3>
            <div className="flex items-center gap-2 text-sm">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <span>{dimensionsText}</span>
            </div>
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={onEdit} className="mt-2">
          Edit
        </Button>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          {isPublic ? (
            <Globe className="h-5 w-5 text-primary" />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className="font-medium">{isPublic ? "Public" : "Private"}</p>
            <p className="text-sm text-muted-foreground">
              {isPublic ? "Other users can see this specimen" : "Only you can see this specimen"}
            </p>
          </div>
        </div>
        <Switch checked={isPublic} onCheckedChange={onVisibilityChange} />
      </div>

      <div className="flex justify-between gap-3 pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={onSubmit} disabled={!canSubmit} className="gap-2">
          Add to Collection
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
