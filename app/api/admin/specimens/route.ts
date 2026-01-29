import { createClient } from "@/lib/supabase/server"
import { checkAdminAuth } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

// GET - List all specimens with pagination and filtering
export async function GET(request: Request) {
  const { isAdmin, user, error: authError } = await checkAdminAuth()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const search = searchParams.get("search") || ""
  const sortBy = searchParams.get("sortBy") || "created_at"
  const sortOrder = searchParams.get("sortOrder") || "desc"

  const offset = (page - 1) * limit

  // If search is provided, find matching specimen IDs via minerals and localities
  let matchingIds: string[] | null = null
  if (search) {
    const idSet = new Set<string>()

    // Search minerals by name
    const { data: matchingMinerals } = await supabase
      .from("minerals")
      .select("id")
      .ilike("name", `%${search}%`)

    if (matchingMinerals?.length) {
      const mineralIds = matchingMinerals.map((m) => m.id)
      const { data: specs } = await supabase
        .from("specimens")
        .select("id")
        .overlaps("mineral_ids", mineralIds)
      specs?.forEach((s) => idSet.add(s.id))
    }

    // Search localities by name
    const { data: matchingLocalities } = await supabase
      .from("localities")
      .select("id")
      .ilike("name", `%${search}%`)

    if (matchingLocalities?.length) {
      const localityIds = matchingLocalities.map((l) => l.id)
      const { data: specs } = await supabase
        .from("specimens")
        .select("id")
        .in("locality_id", localityIds)
      specs?.forEach((s) => idSet.add(s.id))
    }

    matchingIds = Array.from(idSet)
  }

  // Build main query
  let query = supabase
    .from("specimens")
    .select(
      `
      id,
      image_url,
      created_at,
      locality_id,
      mineral_ids,
      length,
      width,
      height,
      is_public,
      localities (id, name)
    `,
      { count: "exact" }
    )

  // Apply search filter
  if (matchingIds !== null) {
    if (matchingIds.length === 0) {
      return NextResponse.json({
        specimens: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      })
    }
    query = query.in("id", matchingIds)
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data: specimens, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Batch fetch all referenced minerals
  const allMineralIds = new Set<string>()
  for (const spec of specimens || []) {
    for (const id of spec.mineral_ids || []) {
      allMineralIds.add(id)
    }
  }

  let mineralsMap: Record<string, { id: string; name: string }> = {}
  if (allMineralIds.size > 0) {
    const { data: minerals } = await supabase
      .from("minerals")
      .select("id, name")
      .in("id", Array.from(allMineralIds))

    if (minerals) {
      for (const m of minerals) {
        mineralsMap[m.id] = { id: m.id, name: m.name }
      }
    }
  }

  // Transform specimens
  const transformedSpecimens = (specimens || []).map((spec) => {
    const mineralIds = spec.mineral_ids || []
    const minerals = mineralIds
      .map((id: string) => mineralsMap[id])
      .filter(Boolean)
    const locality = spec.localities as unknown as {
      id: string
      name: string
    } | null

    return {
      id: spec.id,
      imageUrl: spec.image_url,
      createdAt: spec.created_at,
      minerals,
      locality: locality ? { id: locality.id, name: locality.name } : null,
      length: spec.length,
      width: spec.width,
      height: spec.height,
      isPublic: spec.is_public ?? false,
    }
  })

  return NextResponse.json({
    specimens: transformedSpecimens,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}

// POST - Create new specimen
export async function POST(request: Request) {
  const { isAdmin, user, error: authError } = await checkAdminAuth()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  const supabase = await createClient()
  const body = await request.json()

  // Validate required fields
  if (!body.name || !body.type) {
    return NextResponse.json({ error: "Name and type are required" }, { status: 400 })
  }

  // Validate type
  if (!["mineral", "rock", "fossil"].includes(body.type)) {
    return NextResponse.json({ error: "Type must be mineral, rock, or fossil" }, { status: 400 })
  }

  const specimenData = {
    name: body.name.toLowerCase().trim(),
    type: body.type,
    hardness: body.hardness || null,
    luster: body.luster || null,
    composition: body.composition || null,
    streak: body.streak || null,
    color: body.color || null,
    crystal_system: body.crystal_system || null,
    cleavage: body.cleavage || null,
    fracture: body.fracture || null,
    specific_gravity: body.specific_gravity || null,
    description: body.description || null,
    common_locations: body.common_locations || null,
  }

  const { data: newSpecimen, error } = await supabase
    .from("specimen_reference")
    .insert(specimenData)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      return NextResponse.json({ error: "A specimen with this name already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ specimen: newSpecimen }, { status: 201 })
}
