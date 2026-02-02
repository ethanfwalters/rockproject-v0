import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch recent public specimens from all users
  const { data: specimens, error } = await supabase
    .from("specimens")
    .select(
      `
      id,
      user_id,
      image_url,
      created_at,
      locality_id,
      mineral_ids,
      is_public,
      localities (
        id,
        name,
        kind,
        parent_id
      )
    `
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(4)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get unique user IDs to fetch profiles
  const userIds = [...new Set(specimens.map((s) => s.user_id))]

  let profilesMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username")
      .in("user_id", userIds)

    if (profiles) {
      profilesMap = profiles.reduce(
        (acc, p) => {
          acc[p.user_id] = p.username
          return acc
        },
        {} as Record<string, string>
      )
    }
  }

  // Get all unique mineral IDs
  const allMineralIds = new Set<string>()
  for (const spec of specimens) {
    if (spec.mineral_ids) {
      for (const id of spec.mineral_ids) {
        allMineralIds.add(id)
      }
    }
  }

  let mineralsMap: Record<string, string> = {}
  if (allMineralIds.size > 0) {
    const { data: minerals } = await supabase
      .from("minerals")
      .select("id, name")
      .in("id", Array.from(allMineralIds))

    if (minerals) {
      mineralsMap = minerals.reduce(
        (acc, m) => {
          acc[m.id] = m.name
          return acc
        },
        {} as Record<string, string>
      )
    }
  }

  // Get ancestor locality names for display
  const localityDisplayMap: Record<string, string> = {}
  for (const spec of specimens) {
    const locality = spec.localities as unknown as {
      id: string
      name: string
      kind: string
      parent_id: string | null
    } | null

    if (locality && !localityDisplayMap[locality.id]) {
      // Get parent for a short display path (e.g. "Mine, Country")
      let displayName = locality.name
      if (locality.parent_id) {
        const { data: parent } = await supabase
          .from("localities")
          .select("name")
          .eq("id", locality.parent_id)
          .single()

        if (parent) {
          displayName = `${locality.name}, ${parent.name}`
        }
      }
      localityDisplayMap[locality.id] = displayName
    }
  }

  const transformedSpecimens = specimens.map((spec) => {
    const locality = spec.localities as unknown as {
      id: string
      name: string
      kind: string
      parent_id: string | null
    } | null

    // Use primary mineral name as the display name
    const mineralIds = spec.mineral_ids || []
    const primaryMineralName = mineralIds.length > 0 ? mineralsMap[mineralIds[0]] || "Unknown" : "Unknown"

    return {
      id: spec.id,
      name: primaryMineralName,
      imageUrl: spec.image_url,
      locality: locality ? localityDisplayMap[locality.id] : null,
      addedBy: profilesMap[spec.user_id] || "anonymous",
      createdAt: spec.created_at,
    }
  })

  return NextResponse.json({ specimens: transformedSpecimens })
}
