import { createClient } from "@/lib/supabase/server"
import { checkAdminAuth } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

// GET - Get single specimen
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { isAdmin, user, error: authError } = await checkAdminAuth()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  const supabase = await createClient()
  const { id } = await params

  const { data: specimen, error } = await supabase
    .from("specimen_reference")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Specimen not found" }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ specimen })
}

// PUT - Update specimen
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { isAdmin, user, error: authError } = await checkAdminAuth()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  const supabase = await createClient()
  const { id } = await params
  const body = await request.json()

  // Validate type if provided
  if (body.type && !["mineral", "rock", "fossil"].includes(body.type)) {
    return NextResponse.json({ error: "Type must be mineral, rock, or fossil" }, { status: 400 })
  }

  const specimenData: any = {
    updated_at: new Date().toISOString(),
  }

  // Only update fields that are provided
  if (body.name !== undefined) specimenData.name = body.name.toLowerCase().trim()
  if (body.type !== undefined) specimenData.type = body.type
  if (body.hardness !== undefined) specimenData.hardness = body.hardness || null
  if (body.luster !== undefined) specimenData.luster = body.luster || null
  if (body.composition !== undefined) specimenData.composition = body.composition || null
  if (body.streak !== undefined) specimenData.streak = body.streak || null
  if (body.color !== undefined) specimenData.color = body.color || null
  if (body.crystal_system !== undefined) specimenData.crystal_system = body.crystal_system || null
  if (body.cleavage !== undefined) specimenData.cleavage = body.cleavage || null
  if (body.fracture !== undefined) specimenData.fracture = body.fracture || null
  if (body.specific_gravity !== undefined) specimenData.specific_gravity = body.specific_gravity || null
  if (body.description !== undefined) specimenData.description = body.description || null
  if (body.common_locations !== undefined) specimenData.common_locations = body.common_locations || null

  const { data: updatedSpecimen, error } = await supabase
    .from("specimen_reference")
    .update(specimenData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A specimen with this name already exists" }, { status: 409 })
    }
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Specimen not found" }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ specimen: updatedSpecimen })
}

// DELETE - Delete specimen
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { isAdmin, user, error: authError } = await checkAdminAuth()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  const supabase = await createClient()
  const { id } = await params
  const { error } = await supabase.from("specimen_reference").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
