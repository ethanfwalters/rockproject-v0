import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const parentId = searchParams.get("parentId")
  const kind = searchParams.get("kind")
  const search = searchParams.get("search")
  const roots = searchParams.get("roots") // Get root localities (countries)

  let query = supabase.from("localities").select("*").order("name", { ascending: true })

  if (roots === "true") {
    // Get root localities (countries with no parent)
    query = query.is("parent_id", null)
  } else if (parentId) {
    // Get children of a specific parent
    query = query.eq("parent_id", parentId)
  }

  if (kind) {
    query = query.eq("kind", kind)
  }

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  const { data: localities, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const transformedLocalities = localities.map((locality) => ({
    id: locality.id,
    name: locality.name,
    latitude: locality.latitude,
    longitude: locality.longitude,
    kind: locality.kind,
    parentId: locality.parent_id,
    createdAt: locality.created_at,
  }))

  // Deduplicate by name (handles NULL parent_id constraint issue)
  // Keep the first occurrence (oldest by created_at due to query order)
  const seen = new Set<string>()
  const deduplicatedLocalities = transformedLocalities.filter((locality) => {
    const key = `${locality.name}|${locality.parentId ?? "null"}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })

  return NextResponse.json({ localities: deduplicatedLocalities })
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

  if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
    return NextResponse.json({ error: "Locality name is required" }, { status: 400 })
  }

  if (!body.kind || typeof body.kind !== "string" || body.kind.trim() === "") {
    return NextResponse.json({ error: "Locality kind is required" }, { status: 400 })
  }

  const localityData = {
    name: body.name.trim(),
    kind: body.kind.trim(),
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    parent_id: body.parentId ?? null,
  }

  const { data: newLocality, error } = await supabase.from("localities").insert(localityData).select().single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A locality with this name already exists at this level" }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    locality: {
      id: newLocality.id,
      name: newLocality.name,
      latitude: newLocality.latitude,
      longitude: newLocality.longitude,
      kind: newLocality.kind,
      parentId: newLocality.parent_id,
      createdAt: newLocality.created_at,
    },
  })
}
