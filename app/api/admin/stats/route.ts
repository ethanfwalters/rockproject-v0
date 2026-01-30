import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkAdminAuth } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

// GET - Get dashboard statistics
export async function GET(request: Request) {
  const { isAdmin, user, error: authError } = await checkAdminAuth()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()

  try {
    // --- Platform stats ---

    // Get all auth users
    const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers()
    if (usersError) throw usersError

    const totalUsers = users.length

    // New users this month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newUsersThisMonth = users.filter((u) => {
      return new Date(u.created_at) >= firstDayOfMonth
    }).length

    // User specimens: total count
    const { count: totalUserSpecimens } = await supabase
      .from("specimens")
      .select("*", { count: "exact", head: true })

    // User specimens: created in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: specimensLast24h } = await supabase
      .from("specimens")
      .select("*", { count: "exact", head: true })
      .gte("created_at", twentyFourHoursAgo)

    // --- Minerals stats ---

    // Pending minerals awaiting approval
    const { count: pendingMineralsCount } = await supabase
      .from("minerals")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    // Approved minerals count
    const { count: approvedMineralsCount } = await supabase
      .from("minerals")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")

    // Variety minerals count
    const { count: varietyMineralsCount } = await supabase
      .from("minerals")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("is_variety", true)

    // --- Localities stats ---

    // Total localities
    const { count: totalLocalities } = await supabase
      .from("localities")
      .select("*", { count: "exact", head: true })

    // Localities by kind
    const { data: localityKindData } = await supabase
      .from("localities")
      .select("kind")

    const localityKindCounts: Record<string, number> = {}
    localityKindData?.forEach((item: { kind: string }) => {
      localityKindCounts[item.kind] = (localityKindCounts[item.kind] || 0) + 1
    })

    return NextResponse.json({
      totalUsers,
      newUsersThisMonth,
      totalUserSpecimens: totalUserSpecimens || 0,
      specimensLast24h: specimensLast24h || 0,
      pendingMineralsCount: pendingMineralsCount || 0,
      approvedMineralsCount: approvedMineralsCount || 0,
      varietyMineralsCount: varietyMineralsCount || 0,
      totalLocalities: totalLocalities || 0,
      localityKindCounts,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
