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
  totalCount: z.number(),
  typeCounts: z.object({
    mineral: z.number(),
    rock: z.number(),
    fossil: z.number(),
  }),
  recentlyAdded: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      created_at: z.string(),
    })
  ),
  missingData: z.object({
    hardness: z.number(),
    composition: z.number(),
  }),
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
// Presentation Component Props
// ============================================

export interface AdminLayoutProps {
  children: React.ReactNode
}

export interface AdminDashboardProps {
  stats: DashboardStats | null
}

export interface SpecimenFormProps {
  specimenId?: string
}
