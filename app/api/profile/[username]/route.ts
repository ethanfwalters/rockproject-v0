import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

type Params = Promise<{ username: string }>

export async function GET(
  _request: NextRequest,
  { params }: { params: Params }
) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Look up profile by username
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, username, created_at")
    .eq("username", username)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const isOwnProfile = profile.user_id === user.id

  // Fetch that user's public specimens
  const { data: specimens, error: specimensError } = await supabase
    .from("specimens")
    .select(
      `
      id,
      image_url,
      created_at,
      mineral_ids,
      locality_id,
      localities (
        id,
        name,
        parent_id
      )
    `
    )
    .eq("user_id", profile.user_id)
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  if (specimensError) {
    return NextResponse.json(
      { error: specimensError.message },
      { status: 500 }
    )
  }

  // Batch-load mineral names
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

  // Batch-load locality parent names for display
  const parentIds = new Set<string>()
  for (const spec of specimens) {
    const loc = spec.localities as unknown as {
      parent_id: string | null
    } | null
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

  // Compute stats
  const uniqueMineralIds = new Set<string>()
  const uniqueLocalityIds = new Set<string>()
  for (const spec of specimens) {
    if (spec.mineral_ids) {
      for (const id of spec.mineral_ids) {
        uniqueMineralIds.add(id)
      }
    }
    if (spec.locality_id) {
      uniqueLocalityIds.add(spec.locality_id)
    }
  }

  // Build response
  const transformedSpecimens = specimens.map((spec) => {
    const locality = spec.localities as unknown as {
      id: string
      name: string
      parent_id: string | null
    } | null

    const mineralIds = spec.mineral_ids || []
    const mineralNames = mineralIds
      .map((id: string) => mineralsMap[id])
      .filter(Boolean)

    let localityDisplay: string | null = null
    if (locality) {
      localityDisplay =
        locality.parent_id && parentsMap[locality.parent_id]
          ? `${locality.name}, ${parentsMap[locality.parent_id]}`
          : locality.name
    }

    return {
      id: spec.id,
      imageUrl: spec.image_url,
      createdAt: spec.created_at,
      mineralNames,
      locality: localityDisplay,
    }
  })

  return NextResponse.json({
    profile: {
      username: profile.username,
      createdAt: profile.created_at,
    },
    isOwnProfile,
    stats: {
      totalSpecimens: specimens.length,
      uniqueMinerals: uniqueMineralIds.size,
      uniqueLocalities: uniqueLocalityIds.size,
    },
    specimens: transformedSpecimens,
  })
}
