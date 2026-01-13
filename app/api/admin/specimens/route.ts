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
  const type = searchParams.get("type") || ""
  const sortBy = searchParams.get("sortBy") || "name"
  const sortOrder = searchParams.get("sortOrder") || "asc"

  const offset = (page - 1) * limit

  // Build query
  let query = supabase.from("specimen_reference").select("*", { count: "exact" })

  // Apply search filter
  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  // Apply type filter
  if (type) {
    query = query.eq("type", type)
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data: specimens, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    specimens,
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
