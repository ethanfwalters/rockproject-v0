import { createClient } from "@/lib/supabase/server"
import { checkAdminAuth } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

// GET - Get database statistics
export async function GET(request: Request) {
  const { isAdmin, user, error: authError } = await checkAdminAuth()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    // Get total count
    const { count: totalCount } = await supabase
      .from("specimen_reference")
      .select("*", { count: "exact", head: true })

    // Get count by type
    const { data: typeData } = await supabase.from("specimen_reference").select("type")

    const typeCounts = {
      mineral: 0,
      rock: 0,
      fossil: 0,
    }

    typeData?.forEach((item: { type: string }) => {
      if (item.type in typeCounts) {
        typeCounts[item.type as keyof typeof typeCounts]++
      }
    })

    // Get recently added (last 10)
    const { data: recentlyAdded } = await supabase
      .from("specimen_reference")
      .select("id, name, type, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    // Get specimens with missing data
    const { data: allSpecimens } = await supabase.from("specimen_reference").select("hardness, composition")

    let missingHardness = 0
    let missingComposition = 0

    allSpecimens?.forEach((spec: { hardness: string | null; composition: string | null }) => {
      if (!spec.hardness) missingHardness++
      if (!spec.composition) missingComposition++
    })

    return NextResponse.json({
      totalCount: totalCount || 0,
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
