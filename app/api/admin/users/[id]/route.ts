import { createClient } from "@/lib/supabase/server"
import { checkSuperAdminAuth } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

/**
 * DELETE - Remove admin user
 * Only accessible to super admins
 * Cannot remove yourself
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { isSuperAdmin, user, error: authError } = await checkSuperAdminAuth()

  if (authError || !user || !isSuperAdmin) {
    return NextResponse.json({ error: "Super admin access required" }, { status: 403 })
  }

  const supabase = await createClient()

  // Prevent self-deletion
  const { data: targetAdmin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("id", params.id)
    .single()

  if (targetAdmin?.user_id === user.id) {
    return NextResponse.json({ error: "Cannot remove your own admin access" }, { status: 400 })
  }

  const { error } = await supabase.from("admin_users").delete().eq("id", params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

/**
 * PUT - Update admin user (toggle super admin status)
 * Only accessible to super admins
 * Cannot modify yourself
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { isSuperAdmin, user, error: authError } = await checkSuperAdminAuth()

  if (authError || !user || !isSuperAdmin) {
    return NextResponse.json({ error: "Super admin access required" }, { status: 403 })
  }

  const body = await request.json()
  const { is_super_admin } = body

  if (is_super_admin === undefined) {
    return NextResponse.json({ error: "is_super_admin field required" }, { status: 400 })
  }

  const supabase = await createClient()

  // Prevent self-modification
  const { data: targetAdmin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("id", params.id)
    .single()

  if (targetAdmin?.user_id === user.id) {
    return NextResponse.json(
      { error: "Cannot modify your own super admin status" },
      { status: 400 }
    )
  }

  const { data: updatedAdmin, error } = await supabase
    .from("admin_users")
    .update({
      is_super_admin,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ admin: updatedAdmin })
}
