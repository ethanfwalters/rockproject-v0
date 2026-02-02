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

  // 3a: Fetch recent public specimens with locality data
  const { data: specimens, error } = await supabase
    .from("specimens")
    .select(
      `
      id,
      user_id,
      image_url,
      created_at,
      mineral_ids,
      localities (
        id,
        name,
        latitude,
        longitude,
        kind,
        parent_id
      )
    `
    )
    .eq("is_public", true)
    .not("locality_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 3b: Filter for valid coordinates and take first 50
  const withCoords = specimens.filter((s) => {
    const loc = s.localities as unknown as {
      latitude: number | null
      longitude: number | null
    } | null
    return loc && loc.latitude !== null && loc.longitude !== null
  }).slice(0, 50)

  // 3c: Batch-load mineral names
  const allMineralIds = new Set<string>()
  for (const spec of withCoords) {
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

  // 3d: Batch-load usernames
  const userIds = [...new Set(withCoords.map((s) => s.user_id))]

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

  // 3e: Batch-load locality parent names
  const parentIds = new Set<string>()
  for (const spec of withCoords) {
    const loc = spec.localities as unknown as { parent_id: string | null } | null
    if (loc?.parent_id) {
      parentIds.add(loc.parent_id)
    }
  }

  let parentsMap: Record<string, string> = {}
  if (parentIds.size > 0) {
    const { data: parents } = await supabase
      .from("localities")
      .select("id, name")
      .in("id", Array.from(parentIds))

    if (parents) {
      parentsMap = parents.reduce(
        (acc, p) => {
          acc[p.id] = p.name
          return acc
        },
        {} as Record<string, string>
      )
    }
  }

  // 3f: Build the response
  const transformedSpecimens = withCoords.map((spec) => {
    const locality = spec.localities as unknown as {
      id: string
      name: string
      latitude: number
      longitude: number
      kind: string
      parent_id: string | null
    }

    const mineralIds = spec.mineral_ids || []
    const mineralNames = mineralIds
      .map((id: string) => mineralsMap[id])
      .filter(Boolean)

    const displayName = locality.parent_id && parentsMap[locality.parent_id]
      ? `${locality.name}, ${parentsMap[locality.parent_id]}`
      : locality.name

    return {
      id: spec.id,
      imageUrl: spec.image_url,
      createdAt: spec.created_at,
      mineralNames,
      addedBy: profilesMap[spec.user_id] || "anonymous",
      locality: {
        id: locality.id,
        name: locality.name,
        displayName,
        latitude: locality.latitude,
        longitude: locality.longitude,
      },
    }
  })

  return NextResponse.json({ specimens: transformedSpecimens })
}
