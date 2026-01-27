import { z } from "zod"
import type { CreateSpecimenInput } from "@/types/specimen"
import type { Mineral } from "@/types/mineral"

// ============================================
// Step Types
// ============================================

export const StepSchema = z.enum(["image", "minerals", "locality", "dimensions", "review"])
export type Step = z.infer<typeof StepSchema>

export const STEPS: Step[] = ["image", "minerals", "locality", "dimensions", "review"]

// ============================================
// Flow Props
// ============================================

export interface AddSpecimenFlowProps {
  onClose: () => void
  onAdd: (specimen: CreateSpecimenInput) => void
}

// ============================================
// Step Props
// ============================================

export interface StepImageProps {
  imageUrl: string | undefined
  onImageUrlChange: (url: string | undefined) => void
  onCancel: () => void
  onNext: () => void
}

export interface StepMineralsProps {
  mineralIds: string[]
  minerals: Mineral[]
  onMineralIdsChange: (ids: string[]) => void
  onSelectedMineralsChange: (minerals: Mineral[]) => void
  onBack: () => void
  onNext: () => void
  onSkipToReview: () => void
}

export interface StepLocalityProps {
  localityId: string | undefined
  onLocalityIdChange: (id: string | undefined) => void
  onBack: () => void
  onNext: () => void
  onSkipToReview: () => void
}

export interface StepDimensionsProps {
  length?: number
  width?: number
  height?: number
  onDimensionsChange: (dims: { length?: number; width?: number; height?: number }) => void
  onBack: () => void
  onNext: () => void
}

export interface StepReviewProps {
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
