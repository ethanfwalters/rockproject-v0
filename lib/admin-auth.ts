import { createClient } from "@/lib/supabase/server"

export async function checkAdminAuth() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { isAdmin: false, user: null, error: "Not authenticated" }
  }

  // Check if user is admin by comparing email
  const adminEmail = process.env.ADMIN_EMAIL

  if (!adminEmail) {
    console.warn("ADMIN_EMAIL not set in environment variables")
    return { isAdmin: false, user, error: "Admin email not configured" }
  }

  const isAdmin = user.email === adminEmail

  if (!isAdmin) {
    return { isAdmin: false, user, error: "Not authorized as admin" }
  }

  return { isAdmin: true, user, error: null }
}
