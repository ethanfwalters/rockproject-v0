import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkAdminAuth } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

/**
 * GET - List app users with their specimen counts (paginated)
 * Only accessible to admins
 */
export async function GET(request: Request) {
  const { isAdmin, user, error: authError } = await checkAdminAuth()

  if (authError || !user || !isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("perPage") || "50", 10)))

  const supabase = await createClient()
  const adminClient = createAdminClient()

  try {
    // Get paginated auth users
    const { data: listResult, error: usersError } = await adminClient.auth.admin.listUsers({
      page,
      perPage,
    })

    const users = listResult?.users ?? []
    const totalUsers = (listResult as { users: typeof users; total?: number })?.total ?? users.length

    if (usersError) {
      throw usersError
    }

    // Get specimen counts only for users on this page
    const pageUserIds = users.map((u) => u.id)
    let specimenCounts: Record<string, number> = {}

    if (pageUserIds.length > 0) {
      const { data: specimens } = await supabase
        .from("specimens")
        .select("user_id")
        .in("user_id", pageUserIds)

      specimenCounts = (specimens || []).reduce((acc: Record<string, number>, spec) => {
        acc[spec.user_id] = (acc[spec.user_id] || 0) + 1
        return acc
      }, {})
    }

    // Get profiles for users on this page
    let usernameMap: Record<string, string> = {}
    if (pageUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", pageUserIds)

      usernameMap = (profiles || []).reduce((acc: Record<string, string>, p) => {
        acc[p.user_id] = p.username
        return acc
      }, {})
    }

    // Get aggregate stats
    const { count: totalSpecimens } = await supabase
      .from("specimens")
      .select("*", { count: "exact", head: true })

    const { data: usersWithSpecimensData } = await supabase
      .from("specimens")
      .select("user_id")

    const usersWithSpecimens = new Set((usersWithSpecimensData || []).map((s) => s.user_id)).size

    // Calculate new users this month from the current page
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newUsersThisMonth = users.filter((u) => {
      const createdAt = new Date(u.created_at)
      return createdAt >= firstDayOfMonth
    }).length

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

    return NextResponse.json({
      users: usersWithCounts,
      stats: {
        totalUsers: totalUsers ?? users.length,
        usersWithSpecimens,
        newUsersThisMonth,
        totalSpecimens: totalSpecimens ?? 0,
      },
      pagination: {
        page,
        perPage,
        total: totalUsers ?? users.length,
        totalPages: Math.ceil((totalUsers ?? users.length) / perPage),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
