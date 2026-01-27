import { z } from "zod"
import type { Locality, LocalityWithAncestors, CreateLocalityInput } from "@/types/locality"

// ============================================
// API/Client Types
// ============================================

export const FetchLocalityDetailOptionsSchema = z.object({
  includeChildren: z.boolean().optional(),
  includeSpecimens: z.boolean().optional(),
  includeChildrenSpecimens: z.boolean().optional(),
})

export type FetchLocalityDetailOptions = z.infer<typeof FetchLocalityDetailOptionsSchema>

// ============================================
// Page Props
// ============================================

export interface LocalityDetailPageProps {
  localityId: string
}

// ============================================
// Component Props
// ============================================

export interface LocalityHeaderProps {
  locality: LocalityWithAncestors
  onEdit?: () => void
}

export interface LocalityMapProps {
  locality: LocalityWithAncestors
  height?: string
}

export interface LocalityBreadcrumbProps {
  ancestors: Locality[]
  current: Locality
}

export interface ChildLocalitiesListProps {
  localities: Locality[]
}

export interface EditLocalityFormProps {
  locality: LocalityWithAncestors
  onSave: (data: Partial<CreateLocalityInput>) => void
  onCancel: () => void
  isSaving: boolean
}
