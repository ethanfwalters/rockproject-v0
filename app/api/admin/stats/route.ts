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

    // User specimens: count by type
    const { data: userTypeData } = await supabase.from("specimens").select("type")

    const userTypeCounts = { mineral: 0, rock: 0, fossil: 0 }
    userTypeData?.forEach((item: { type: string }) => {
      if (item.type in userTypeCounts) {
        userTypeCounts[item.type as keyof typeof userTypeCounts]++
      }
    })

    // --- Reference database stats ---

    // Reference total count
    const { count: referenceCount } = await supabase
      .from("specimen_reference")
      .select("*", { count: "exact", head: true })

    // Reference count by type
    const { data: typeData } = await supabase.from("specimen_reference").select("type")

    const typeCounts = { mineral: 0, rock: 0, fossil: 0 }
    typeData?.forEach((item: { type: string }) => {
      if (item.type in typeCounts) {
        typeCounts[item.type as keyof typeof typeCounts]++
      }
    })

    // Recently added references (last 10)
    const { data: recentlyAdded } = await supabase
      .from("specimen_reference")
      .select("id, name, type, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    // Specimens with missing data
    const { data: allSpecimens } = await supabase.from("specimen_reference").select("hardness, composition")

    let missingHardness = 0
    let missingComposition = 0

    allSpecimens?.forEach((spec: { hardness: string | null; composition: string | null }) => {
      if (!spec.hardness) missingHardness++
      if (!spec.composition) missingComposition++
    })

    return NextResponse.json({
      totalUsers,
      newUsersThisMonth,
      totalUserSpecimens: totalUserSpecimens || 0,
      specimensLast24h: specimensLast24h || 0,
      userTypeCounts,
      referenceCount: referenceCount || 0,
      typeCounts,
      recentlyAdded: recentlyAdded || [],
      missingData: {
        hardness: missingHardness,
        composition: missingComposition,
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
