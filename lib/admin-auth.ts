import { createClient } from "@/lib/supabase/server"

export type AdminAuthResult = {
  isAdmin: boolean
  isSuperAdmin: boolean
  user: any | null
  error: string | null
}

/**
 * Check if the current user is an admin (regular or super)
 * Queries the admin_users table to determine admin status
 */
export async function checkAdminAuth(): Promise<AdminAuthResult> {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { isAdmin: false, isSuperAdmin: false, user: null, error: "Not authenticated" }
  }

  // Check if user exists in admin_users table
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("is_super_admin")
    .eq("user_id", user.id)
    .single()

  if (adminError || !adminUser) {
    return { isAdmin: false, isSuperAdmin: false, user, error: "Not authorized as admin" }
  }

  return {
    isAdmin: true,
    isSuperAdmin: adminUser.is_super_admin,
    user,
    error: null,
  }
}

/**
 * Check if the current user is a super admin (stricter check)
 * Super admins have additional privileges like managing other admin users
 */
export async function checkSuperAdminAuth(): Promise<AdminAuthResult> {
  const result = await checkAdminAuth()

  if (!result.isAdmin || !result.isSuperAdmin) {
    return {
      ...result,
      error: "Super admin access required",
    }
  }

  return result
}
