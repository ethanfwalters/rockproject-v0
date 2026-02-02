import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getAncestors } from "@/lib/api/localities"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch the specimen with locality join
  const { data: specimen, error } = await supabase
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
    .eq("id", id)
    .single()

  if (error || !specimen) {
    return NextResponse.json({ error: "Specimen not found" }, { status: 404 })
  }

  // Check access: must be the owner or the specimen must be public
  const isOwner = specimen.user_id === user.id
  if (!isOwner && !specimen.is_public) {
    return NextResponse.json({ error: "Specimen not found" }, { status: 404 })
  }

  // Fetch minerals
  const mineralIds = specimen.mineral_ids || []
  let minerals: Array<{ id: string; name: string; createdAt: string }> = []
  if (mineralIds.length > 0) {
    const { data: mineralsData } = await supabase
      .from("minerals")
      .select("id, name, created_at")
      .in("id", mineralIds)

    if (mineralsData) {
      const mineralsMap = mineralsData.reduce(
        (acc, m) => {
          acc[m.id] = { id: m.id, name: m.name, createdAt: m.created_at }
          return acc
        },
        {} as Record<string, { id: string; name: string; createdAt: string }>
      )
      minerals = mineralIds.map((mid: string) => mineralsMap[mid]).filter(Boolean)
    }
  }

  // Fetch locality ancestors
  const locality = specimen.localities as unknown as {
    id: string
    name: string
    latitude: number | null
    longitude: number | null
    kind: string
    parent_id: string | null
    created_at: string
  } | null

  let localityData = null
  if (locality) {
    const ancestors = await getAncestors(supabase, locality.parent_id)
    const pathParts = [locality.name, ...ancestors.map((a) => a.name)]
    localityData = {
      id: locality.id,
      name: locality.name,
      latitude: locality.latitude,
      longitude: locality.longitude,
      kind: locality.kind,
      parentId: locality.parent_id,
      createdAt: locality.created_at,
      ancestors,
      fullPath: pathParts.join(", "),
    }
  }

  const transformedSpecimen = {
    id: specimen.id,
    imageUrl: specimen.image_url,
    createdAt: specimen.created_at,
    localityId: specimen.locality_id,
    mineralIds,
    length: specimen.length,
    width: specimen.width,
    height: specimen.height,
    isPublic: specimen.is_public ?? false,
    locality: localityData,
    minerals,
  }

  return NextResponse.json({ specimen: transformedSpecimen, isOwner })
}
