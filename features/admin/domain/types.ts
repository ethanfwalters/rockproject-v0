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
