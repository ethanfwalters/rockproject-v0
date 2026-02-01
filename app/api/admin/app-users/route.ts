import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkAdminAuth } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

/**
 * GET - List all app users with their specimen counts
 * Only accessible to admins
 */
export async function GET(request: Request) {
  const { isAdmin, user, error: authError } = await checkAdminAuth()

  if (authError || !user || !isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()

  try {
    // Get all auth users
    const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers()

    if (usersError) {
      throw usersError
    }

    // Get specimen counts per user
    const { data: specimens } = await supabase
      .from("specimens")
      .select("user_id")

    const specimenCounts = specimens?.reduce((acc: Record<string, number>, spec) => {
      acc[spec.user_id] = (acc[spec.user_id] || 0) + 1
      return acc
    }, {}) || {}

    // Get profiles (usernames) for all users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username")

    const usernameMap = (profiles || []).reduce((acc: Record<string, string>, p) => {
      acc[p.user_id] = p.username
      return acc
    }, {})

    // Combine user data with specimen counts and usernames
    const usersWithCounts = users.map((u) => ({
      id: u.id,
      email: u.email || "",
      username: usernameMap[u.id] || null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      specimen_count: specimenCounts[u.id] || 0,
    }))

    // Sort by most recent first
    usersWithCounts.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Get stats
    const totalUsers = users.length
    const usersWithSpecimens = Object.keys(specimenCounts).length
    const totalSpecimens = specimens?.length || 0

    // Calculate new users this month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newUsersThisMonth = users.filter((u) => {
      const createdAt = new Date(u.created_at)
      return createdAt >= firstDayOfMonth
    }).length

    return NextResponse.json({
      users: usersWithCounts,
      stats: {
        totalUsers,
        usersWithSpecimens,
        newUsersThisMonth,
        totalSpecimens,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
