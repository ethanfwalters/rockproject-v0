import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

type Params = Promise<{ id: string }>

async function getAncestors(
  supabase: Awaited<ReturnType<typeof createClient>>,
  parentId: string | null
): Promise<Array<{ id: string; name: string; kind: string; parentId: string | null }>> {
  if (!parentId) return []

  const { data: parent, error } = await supabase
    .from("localities")
    .select("id, name, kind, parent_id")
    .eq("id", parentId)
    .single()

  if (error || !parent) return []

  const ancestors = await getAncestors(supabase, parent.parent_id)

  return [
    {
      id: parent.id,
      name: parent.name,
      kind: parent.kind,
      parentId: parent.parent_id,
    },
    ...ancestors,
  ]
}

export async function GET(request: Request, segmentData: { params: Params }) {
  const supabase = await createClient()
  const params = await segmentData.params
  const id = params.id

  // Parse query parameters
  const { searchParams } = new URL(request.url)
  const includeChildren = searchParams.get("includeChildren") === "true"
  const includeSpecimens = searchParams.get("includeSpecimens") === "true"
  const includeChildrenSpecimens = searchParams.get("includeChildrenSpecimens") === "true"

  const { data: locality, error } = await supabase
    .from("localities")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Locality not found" }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get ancestors (parent chain up to root)
  const ancestors = await getAncestors(supabase, locality.parent_id)

  // Build full path (from leaf to root)
  const pathParts = [locality.name, ...ancestors.map((a) => a.name)]
  const fullPath = pathParts.join(", ")

  // Response object
  const response: Record<string, unknown> = {
    locality: {
      id: locality.id,
      name: locality.name,
      latitude: locality.latitude,
      longitude: locality.longitude,
      kind: locality.kind,
      parentId: locality.parent_id,
      createdAt: locality.created_at,
      ancestors,
      fullPath,
    },
  }

  // Fetch children if requested
  let childIds: string[] = []
  if (includeChildren || includeChildrenSpecimens) {
    const { data: children } = await supabase
      .from("localities")
      .select("id, name, latitude, longitude, kind, parent_id, created_at")
      .eq("parent_id", id)
      .order("name", { ascending: true })

    if (children) {
      childIds = children.map((c) => c.id)
      response.children = children.map((c) => ({
        id: c.id,
        name: c.name,
        latitude: c.latitude,
        longitude: c.longitude,
        kind: c.kind,
        parentId: c.parent_id,
        createdAt: c.created_at,
      }))
    } else {
      response.children = []
    }
  }

  // Fetch specimens if requested
  if (includeSpecimens) {
    // Get current user for identifying own specimens
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Build locality IDs to query
    const localityIds = [id]
    if (includeChildrenSpecimens && childIds.length > 0) {
      localityIds.push(...childIds)
    }

    // Fetch specimens
    const { data: specimens } = await supabase
      .from("specimens")
      .select("id, image_url, created_at, mineral_ids, is_public, user_id, locality_id")
      .in("locality_id", localityIds)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50)

    // Get mineral names for all specimens
    const allMineralIds = new Set<string>()
    for (const spec of specimens || []) {
      if (spec.mineral_ids) {
        for (const mineralId of spec.mineral_ids) {
          allMineralIds.add(mineralId)
        }
      }
    }

    let mineralsMap: Record<string, { id: string; name: string }> = {}
    if (allMineralIds.size > 0) {
      const { data: minerals } = await supabase
        .from("minerals")
        .select("id, name")
        .in("id", Array.from(allMineralIds))

      if (minerals) {
        mineralsMap = minerals.reduce(
          (acc, m) => {
            acc[m.id] = { id: m.id, name: m.name }
            return acc
          },
          {} as Record<string, { id: string; name: string }>
        )
      }
    }

    const transformedSpecimens = (specimens || []).map((spec) => {
      const mineralIds = spec.mineral_ids || []
      const mineralsList = mineralIds.map((mid: string) => mineralsMap[mid]).filter(Boolean)

      return {
        id: spec.id,
        imageUrl: spec.image_url,
        createdAt: spec.created_at,
        minerals: mineralsList,
        isPublic: spec.is_public ?? false,
        isOwn: user ? spec.user_id === user.id : false,
      }
    })

    response.specimens = transformedSpecimens
    response.specimenCount = transformedSpecimens.length
  }

  return NextResponse.json(response)
}

export async function PUT(request: Request, segmentData: { params: Params }) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const params = await segmentData.params
  const id = params.id
  const body = await request.json()

  const updateData: Record<string, unknown> = {}

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json({ error: "Locality name cannot be empty" }, { status: 400 })
    }
    updateData.name = body.name.trim()
  }

  if (body.kind !== undefined) {
    if (typeof body.kind !== "string" || body.kind.trim() === "") {
      return NextResponse.json({ error: "Locality kind cannot be empty" }, { status: 400 })
    }
    updateData.kind = body.kind.trim()
  }

  if (body.latitude !== undefined) {
    updateData.latitude = body.latitude
  }

  if (body.longitude !== undefined) {
    updateData.longitude = body.longitude
  }

  if (body.parentId !== undefined) {
    updateData.parent_id = body.parentId
  }

  const { data: updatedLocality, error } = await supabase
    .from("localities")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A locality with this name already exists at this level" }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    locality: {
      id: updatedLocality.id,
      name: updatedLocality.name,
      latitude: updatedLocality.latitude,
      longitude: updatedLocality.longitude,
      kind: updatedLocality.kind,
      parentId: updatedLocality.parent_id,
      createdAt: updatedLocality.created_at,
    },
  })
}

export async function DELETE(request: Request, segmentData: { params: Params }) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const params = await segmentData.params
  const id = params.id

  // Check if locality has children
  const { data: children } = await supabase.from("localities").select("id").eq("parent_id", id).limit(1)

  if (children && children.length > 0) {
    return NextResponse.json(
      { error: "Cannot delete locality with children. Delete children first." },
      { status: 400 }
    )
  }

  // Check if locality is referenced by specimens
  const { data: specimens } = await supabase.from("specimens").select("id").eq("locality_id", id).limit(1)

  if (specimens && specimens.length > 0) {
    return NextResponse.json(
      { error: "Cannot delete locality that is referenced by specimens." },
      { status: 400 }
    )
  }

  const { error } = await supabase.from("localities").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
