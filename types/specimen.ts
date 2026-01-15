import type { Locality, LocalityWithAncestors } from "./locality"
import type { Mineral } from "./mineral"

export type Specimen = {
  id: string
  imageUrl?: string
  createdAt: string
  localityId?: string
  mineralIds: string[] // Ordered array - position determines rank (1st = primary, 2nd = secondary, etc.)
  length?: number // in mm
  width?: number // in mm
  height?: number // in mm
  // Populated relations (for display)
  locality?: LocalityWithAncestors
  minerals?: Mineral[]
}

export type SpecimenWithRelations = Specimen & {
  locality: Locality | null
  minerals: Mineral[]
}

export type CreateSpecimenInput = {
  imageUrl?: string
  localityId?: string
  mineralIds?: string[]
  length?: number
  width?: number
  height?: number
}

export type UpdateSpecimenInput = Partial<CreateSpecimenInput> & {
  id: string
}
