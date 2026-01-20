import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const includeVarietyInfo = searchParams.get("includeVarietyInfo") === "true"

  // Try query with variety_of join first, fall back to simpler query if column doesn't exist
  let minerals: Record<string, unknown>[] | null = null
  let error: { message: string } | null = null

  if (includeVarietyInfo) {
    // Full query with variety info
    let query = supabase
      .from("minerals")
      .select("*, variety_of_mineral:variety_of(id, name)")
      .order("name", { ascending: true })

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    const result = await query
    minerals = result.data
    error = result.error
  }

  // If variety query failed or wasn't requested, use simple query
  if (!minerals) {
    let query = supabase
      .from("minerals")
      .select("*")
      .order("name", { ascending: true })

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    const result = await query
    minerals = result.data
    error = result.error
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const transformedMinerals = (minerals || []).map((mineral) => ({
    id: mineral.id,
    name: mineral.name,
    chemicalFormula: mineral.chemical_formula,
    isVariety: mineral.is_variety ?? false,
    varietyOf: mineral.variety_of ?? null,
    varietyOfMineral: mineral.variety_of_mineral
      ? {
          id: (mineral.variety_of_mineral as { id: string; name: string }).id,
          name: (mineral.variety_of_mineral as { id: string; name: string }).name,
        }
      : null,
    createdAt: mineral.created_at,
  }))

  return NextResponse.json({ minerals: transformedMinerals })
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
    return NextResponse.json({ error: "Mineral name is required" }, { status: 400 })
  }

  // Validate that varietyOf is provided when isVariety is true
  if (body.isVariety && !body.varietyOf) {
    return NextResponse.json({ error: "Parent mineral is required for varieties" }, { status: 400 })
  }

  const insertData: { name: string; chemical_formula?: string; is_variety?: boolean; variety_of?: string } = {
    name: body.name.trim(),
  }

  if (body.chemicalFormula && typeof body.chemicalFormula === "string") {
    insertData.chemical_formula = body.chemicalFormula.trim()
  }

  if (typeof body.isVariety === "boolean") {
    insertData.is_variety = body.isVariety
  }

  if (body.varietyOf && typeof body.varietyOf === "string") {
    insertData.variety_of = body.varietyOf
  }

  const { data: newMineral, error } = await supabase
    .from("minerals")
    .insert(insertData)
    .select("*, variety_of_mineral:variety_of(id, name)")
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A mineral with this name already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    mineral: {
      id: newMineral.id,
      name: newMineral.name,
      chemicalFormula: newMineral.chemical_formula,
      isVariety: newMineral.is_variety ?? false,
      varietyOf: newMineral.variety_of,
      varietyOfMineral: newMineral.variety_of_mineral
        ? {
            id: newMineral.variety_of_mineral.id,
            name: newMineral.variety_of_mineral.name,
          }
        : null,
      createdAt: newMineral.created_at,
    },
  })
}
