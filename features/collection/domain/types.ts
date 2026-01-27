import { z } from "zod"
import type { Specimen } from "@/types/specimen"

// ============================================
// Collection Stats Types
// ============================================

export const MineralCountSchema = z.object({
  name: z.string(),
  count: z.number(),
})

export type MineralCount = z.infer<typeof MineralCountSchema>

export const CollectionStatsSchema = z.object({
  total: z.number(),
  mineralCount: z.array(MineralCountSchema),
  totalMinerals: z.number(),
  mostCommon: MineralCountSchema.nullable(),
  uniqueLocations: z.number(),
  recentAdditions: z.array(z.any()), // TODO: this should be SpecimenSchema when available
})

export type CollectionStats = z.infer<typeof CollectionStatsSchema>

export interface CollectionStatsProps {
  specimens: Specimen[]
}

// ============================================
// Collection Overview Types
// ============================================

export const ViewModeSchema = z.enum(["card", "table"])
export type ViewMode = z.infer<typeof ViewModeSchema>

export const SortOptionSchema = z.enum(["mineral", "locality", "date", "dimensions"])
export type SortOption = z.infer<typeof SortOptionSchema>

export const SortDirectionSchema = z.enum(["asc", "desc"])
export type SortDirection = z.infer<typeof SortDirectionSchema>

export interface CollectionOverviewProps {
  specimens: Specimen[]
  onSelectSpecimen: (specimen: Specimen) => void
}

// ============================================
// Collection Map Types
// ============================================

export interface CollectionMapProps {
  specimens: Specimen[]
  height?: string
  showCard?: boolean
}
