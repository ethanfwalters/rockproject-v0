import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { deleteFromS3 } from "@/lib/s3/upload"
import { getAncestors } from "@/lib/api/localities"
import type { Locality } from "@/types/locality"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch specimens with locality join
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
      length,
      width,
      height,
      is_public,
      localities (
        id,
        name,
        latitude,
        longitude,
        kind,
        parent_id,
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get all unique mineral IDs from all specimens
  const allMineralIds = new Set<string>()
  for (const spec of specimens) {
    if (spec.mineral_ids) {
      for (const id of spec.mineral_ids) {
        allMineralIds.add(id)
      }
    }
  }

  // Fetch all minerals in one query
  let mineralsMap: Record<string, { id: string; name: string; createdAt: string }> = {}
  if (allMineralIds.size > 0) {
    const { data: minerals } = await supabase
      .from("minerals")
      .select("id, name, created_at")
      .in("id", Array.from(allMineralIds))

    if (minerals) {
      mineralsMap = minerals.reduce(
        (acc, m) => {
          acc[m.id] = { id: m.id, name: m.name, createdAt: m.created_at }
          return acc
        },
        {} as Record<string, { id: string; name: string; createdAt: string }>
      )
    }
  }

  // Fetch ancestors for all localities that have parents
  const localityAncestorsMap: Record<string, { ancestors: Locality[]; fullPath: string }> = {}
  for (const spec of specimens) {
    const locality = spec.localities as unknown as {
      id: string
      name: string
      latitude: number | null
      longitude: number | null
      kind: string
      parent_id: string | null
      created_at: string
    } | null

    if (locality && !localityAncestorsMap[locality.id]) {
      const ancestors = await getAncestors(supabase, locality.parent_id)
      const pathParts = [locality.name, ...ancestors.map((a) => a.name)]
      localityAncestorsMap[locality.id] = {
        ancestors,
        fullPath: pathParts.join(", "),
      }
    }
  }

  // Transform specimens
  const transformedSpecimens = specimens.map((spec) => {
    const locality = spec.localities as unknown as {
      id: string
      name: string
      latitude: number | null
      longitude: number | null
      kind: string
      parent_id: string | null
      created_at: string
    } | null

    const mineralIds = spec.mineral_ids || []
    const minerals = mineralIds.map((id: string) => mineralsMap[id]).filter(Boolean)

    const localityData = locality
      ? {
          id: locality.id,
          name: locality.name,
          latitude: locality.latitude,
          longitude: locality.longitude,
          kind: locality.kind,
          parentId: locality.parent_id,
          createdAt: locality.created_at,
          ...localityAncestorsMap[locality.id],
        }
      : null

    return {
      id: spec.id,
      imageUrl: spec.image_url,
      createdAt: spec.created_at,
      localityId: spec.locality_id,
      mineralIds,
      length: spec.length,
      width: spec.width,
      height: spec.height,
      isPublic: spec.is_public ?? false,
      locality: localityData,
      minerals,
    }
  })

  return NextResponse.json({ specimens: transformedSpecimens })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const specimenData = {
    user_id: user.id,
    image_url: body.imageUrl || null,
    locality_id: body.localityId || null,
    mineral_ids: body.mineralIds || [],
    length: body.length ?? null,
    width: body.width ?? null,
    height: body.height ?? null,
    is_public: body.isPublic ?? false,
  }

  const { data: newSpecimen, error } = await supabase.from("specimens").insert(specimenData).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch related data for response
  let locality = null
  if (newSpecimen.locality_id) {
    const { data: localityData } = await supabase
      .from("localities")
      .select("*")
      .eq("id", newSpecimen.locality_id)
      .single()

    if (localityData) {
      const ancestors = await getAncestors(supabase, localityData.parent_id)
      const pathParts = [localityData.name, ...ancestors.map((a) => a.name)]
      locality = {
        id: localityData.id,
        name: localityData.name,
        latitude: localityData.latitude,
        longitude: localityData.longitude,
        kind: localityData.kind,
        parentId: localityData.parent_id,
        createdAt: localityData.created_at,
        ancestors,
        fullPath: pathParts.join(", "),
      }
    }
  }

  let minerals: Array<{ id: string; name: string; createdAt: string }> = []
  if (newSpecimen.mineral_ids && newSpecimen.mineral_ids.length > 0) {
    const { data: mineralsData } = await supabase
      .from("minerals")
      .select("id, name, created_at")
      .in("id", newSpecimen.mineral_ids)

    if (mineralsData) {
      // Preserve order from mineral_ids
      const mineralsMap = mineralsData.reduce(
        (acc, m) => {
          acc[m.id] = { id: m.id, name: m.name, createdAt: m.created_at }
          return acc
        },
        {} as Record<string, { id: string; name: string; createdAt: string }>
      )
      minerals = newSpecimen.mineral_ids.map((id: string) => mineralsMap[id]).filter(Boolean)
    }
  }

  const transformedSpecimen = {
    id: newSpecimen.id,
    imageUrl: newSpecimen.image_url,
    createdAt: newSpecimen.created_at,
    localityId: newSpecimen.locality_id,
    mineralIds: newSpecimen.mineral_ids || [],
    length: newSpecimen.length,
    width: newSpecimen.width,
    height: newSpecimen.height,
    isPublic: newSpecimen.is_public ?? false,
    locality,
    minerals,
  }

  return NextResponse.json({ specimen: transformedSpecimen })
}

export async function PUT(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  if (!body.id) {
    return NextResponse.json({ error: "Specimen ID is required" }, { status: 400 })
  }

  // Fetch the existing specimen to get the old image URL
  const { data: existingSpecimen } = await supabase
    .from("specimens")
    .select("image_url")
    .eq("id", body.id)
    .eq("user_id", user.id)
    .single()

  const specimenData: Record<string, unknown> = {}

  if (body.imageUrl !== undefined) {
    specimenData.image_url = body.imageUrl || null
  }
  if (body.localityId !== undefined) {
    specimenData.locality_id = body.localityId || null
  }
  if (body.mineralIds !== undefined) {
    specimenData.mineral_ids = body.mineralIds || []
  }
  if (body.length !== undefined) {
    specimenData.length = body.length ?? null
  }
  if (body.width !== undefined) {
    specimenData.width = body.width ?? null
  }
  if (body.height !== undefined) {
    specimenData.height = body.height ?? null
  }
  if (body.isPublic !== undefined) {
    specimenData.is_public = body.isPublic
  }

  const { data: updatedSpecimen, error } = await supabase
    .from("specimens")
    .update(specimenData)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Delete old image from S3 if it was changed
  if (existingSpecimen?.image_url && existingSpecimen.image_url !== body.imageUrl) {
    try {
      await deleteFromS3(existingSpecimen.image_url)
    } catch (err) {
      console.error("Failed to delete old image from S3:", err)
    }
  }

  // Fetch related data for response
  let locality = null
  if (updatedSpecimen.locality_id) {
    const { data: localityData } = await supabase
      .from("localities")
      .select("*")
      .eq("id", updatedSpecimen.locality_id)
      .single()

    if (localityData) {
      const ancestors = await getAncestors(supabase, localityData.parent_id)
      const pathParts = [localityData.name, ...ancestors.map((a) => a.name)]
      locality = {
        id: localityData.id,
        name: localityData.name,
        latitude: localityData.latitude,
        longitude: localityData.longitude,
        kind: localityData.kind,
        parentId: localityData.parent_id,
        createdAt: localityData.created_at,
        ancestors,
        fullPath: pathParts.join(", "),
      }
    }
  }

  let minerals: Array<{ id: string; name: string; createdAt: string }> = []
  if (updatedSpecimen.mineral_ids && updatedSpecimen.mineral_ids.length > 0) {
    const { data: mineralsData } = await supabase
      .from("minerals")
      .select("id, name, created_at")
      .in("id", updatedSpecimen.mineral_ids)

    if (mineralsData) {
      const mineralsMap = mineralsData.reduce(
        (acc, m) => {
          acc[m.id] = { id: m.id, name: m.name, createdAt: m.created_at }
          return acc
        },
        {} as Record<string, { id: string; name: string; createdAt: string }>
      )
      minerals = updatedSpecimen.mineral_ids.map((id: string) => mineralsMap[id]).filter(Boolean)
    }
  }

  const transformedSpecimen = {
    id: updatedSpecimen.id,
    imageUrl: updatedSpecimen.image_url,
    createdAt: updatedSpecimen.created_at,
    localityId: updatedSpecimen.locality_id,
    mineralIds: updatedSpecimen.mineral_ids || [],
    length: updatedSpecimen.length,
    width: updatedSpecimen.width,
    height: updatedSpecimen.height,
    isPublic: updatedSpecimen.is_public ?? false,
    locality,
    minerals,
  }

  return NextResponse.json({ specimen: transformedSpecimen })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Specimen ID is required" }, { status: 400 })
  }

  // Fetch the specimen to get its image URL before deletion
  const { data: specimen } = await supabase
    .from("specimens")
    .select("image_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  const { error } = await supabase.from("specimens").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Delete image from S3 if it exists
  if (specimen?.image_url) {
    try {
      await deleteFromS3(specimen.image_url)
    } catch (err) {
      console.error("Failed to delete image from S3:", err)
    }
  }

  return NextResponse.json({ success: true })
}
