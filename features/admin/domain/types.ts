import { z } from "zod"

// ============================================
// Admin User Types
// ============================================

export const AdminUserSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  email: z.string(),
  is_super_admin: z.boolean(),
  granted_at: z.string(),
  created_at: z.string(),
})

export type AdminUser = z.infer<typeof AdminUserSchema>

// ============================================
// App User Types
// ============================================

export const AppUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  created_at: z.string(),
  last_sign_in_at: z.string().nullable(),
  specimen_count: z.number(),
})

export type AppUser = z.infer<typeof AppUserSchema>

export const AppUsersStatsSchema = z.object({
  totalUsers: z.number(),
  usersWithSpecimens: z.number(),
  newUsersThisMonth: z.number(),
  totalSpecimens: z.number(),
})

export type AppUsersStats = z.infer<typeof AppUsersStatsSchema>

export const AppUsersResponseSchema = z.object({
  users: z.array(AppUserSchema),
  stats: AppUsersStatsSchema,
})

export type AppUsersResponse = z.infer<typeof AppUsersResponseSchema>

// ============================================
// Admin Specimen Types
// ============================================

export const AdminSpecimenSchema = z.object({
  id: z.string(),
  imageUrl: z.string().nullable().optional(),
  createdAt: z.string(),
  minerals: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  locality: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable(),
  length: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  isPublic: z.boolean(),
})

export type AdminSpecimen = z.infer<typeof AdminSpecimenSchema>

export const SpecimenFormDataSchema = z.object({
  name: z.string(),
  type: z.enum(["mineral", "rock", "fossil"]),
  hardness: z.string(),
  luster: z.string(),
  composition: z.string(),
  streak: z.string(),
  color: z.string(),
  crystal_system: z.string(),
  cleavage: z.string(),
  fracture: z.string(),
  specific_gravity: z.string(),
  description: z.string(),
  common_locations: z.string(),
})

export type SpecimenFormData = z.infer<typeof SpecimenFormDataSchema>

export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export type Pagination = z.infer<typeof PaginationSchema>

// ============================================
// Dashboard Stats Types
// ============================================

export const DashboardStatsSchema = z.object({
  // Platform stats
  totalUsers: z.number(),
  newUsersThisMonth: z.number(),
  totalUserSpecimens: z.number(),
  specimensLast24h: z.number(),
  // Minerals stats
  pendingMineralsCount: z.number(),
  approvedMineralsCount: z.number(),
  varietyMineralsCount: z.number(),
  // Localities stats
  totalLocalities: z.number(),
  localityKindCounts: z.record(z.string(), z.number()),
})

export type DashboardStats = z.infer<typeof DashboardStatsSchema>

// ============================================
// Import Types
// ============================================

export const ImportResultSchema = z.object({
  total: z.number(),
  imported: z.number(),
  skipped: z.number(),
  errors: z.array(
    z.object({
      row: z.number(),
      name: z.string(),
      error: z.string(),
    })
  ),
})

export type ImportResult = z.infer<typeof ImportResultSchema>

// ============================================
// Admin Mineral Types
// ============================================

export const AdminMineralSchema = z.object({
  id: z.string(),
  name: z.string(),
  chemicalFormula: z.string().nullable().optional(),
  isVariety: z.boolean(),
  varietyOf: z.string().nullable().optional(),
  varietyOfMineral: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  createdAt: z.string(),
})

export type AdminMineral = z.infer<typeof AdminMineralSchema>

export const AdminMineralsStatsSchema = z.object({
  total: z.number(),
  nonVarieties: z.number(),
  varieties: z.number(),
})

export type AdminMineralsStats = z.infer<typeof AdminMineralsStatsSchema>

export const SubmittedMineralSchema = z.object({
  id: z.string(),
  name: z.string(),
  chemicalFormula: z.string().nullable().optional(),
  isVariety: z.boolean(),
  varietyOf: z.string().nullable().optional(),
  varietyOfMineral: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  submittedBy: z.string().nullable().optional(),
  submitterEmail: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]),
  adminNotes: z.string().nullable().optional(),
  reviewedBy: z.string().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
  createdAt: z.string(),
})

export type SubmittedMineral = z.infer<typeof SubmittedMineralSchema>

// ============================================
// Update Mineral Types
// ============================================

export const UpdateMineralInputSchema = z.object({
  name: z.string().min(1),
  chemicalFormula: z.string().nullable().optional(),
  isVariety: z.boolean(),
  varietyOf: z.string().nullable().optional(),
})

export type UpdateMineralInput = z.infer<typeof UpdateMineralInputSchema>

// ============================================
// Presentation Component Props
// ============================================

export interface AdminLayoutProps {
  children: React.ReactNode
}

export interface AdminDashboardProps {}

export interface SpecimenFormProps {
  specimenId?: string
}
