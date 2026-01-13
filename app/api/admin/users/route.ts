import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkSuperAdminAuth } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

/**
 * GET - List all admin users
 * Only accessible to super admins
 */
export async function GET(request: Request) {
  const { isSuperAdmin, user, error: authError } = await checkSuperAdminAuth()

  if (authError || !user || !isSuperAdmin) {
    return NextResponse.json({ error: "Super admin access required" }, { status: 403 })
  }

  const supabase = await createClient()

  const { data: admins, error } = await supabase
    .from("admin_users")
    .select("id, user_id, email, is_super_admin, granted_at, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ admins })
}

/**
 * POST - Add new admin user
 * Only accessible to super admins
 * User must have an existing account before being made admin
 */
export async function POST(request: Request) {
  const { isSuperAdmin, user, error: authError } = await checkSuperAdminAuth()

  if (authError || !user || !isSuperAdmin) {
    return NextResponse.json({ error: "Super admin access required" }, { status: 403 })
  }

  const body = await request.json()
  const { email, is_super_admin = false } = body

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Find user by email in auth.users (requires service role key)
  const { data: { users }, error: userError } = await adminClient.auth.admin.listUsers()

  if (userError) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }

  const targetUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

  if (!targetUser) {
    return NextResponse.json({ error: "User not found. They must have an account first." }, { status: 404 })
  }

  // Check if already admin
  const { data: existingAdmin } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", targetUser.id)
    .single()

  if (existingAdmin) {
    return NextResponse.json({ error: "User is already an admin" }, { status: 409 })
  }

  // Insert new admin
  const { data: newAdmin, error: insertError } = await supabase
    .from("admin_users")
    .insert({
      user_id: targetUser.id,
      email: targetUser.email,
      is_super_admin,
      granted_by: user.id,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ admin: newAdmin }, { status: 201 })
}
