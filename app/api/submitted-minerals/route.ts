import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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

  const name = body.name.trim()

  // Check for existing approved mineral with same name
  const { data: existing } = await supabase
    .from("minerals")
    .select("id")
    .eq("status", "approved")
    .ilike("name", name)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "An approved mineral with this name already exists" },
      { status: 409 }
    )
  }

  // Check for duplicate pending submission from this user
  const { data: pendingDupe } = await supabase
    .from("minerals")
    .select("id")
    .eq("status", "pending")
    .eq("submitted_by", user.id)
    .ilike("name", name)
    .limit(1)

  if (pendingDupe && pendingDupe.length > 0) {
    return NextResponse.json(
      { error: "You already have a pending submission for this mineral" },
      { status: 409 }
    )
  }

  const insertData: Record<string, unknown> = {
    name,
    status: "pending",
    submitted_by: user.id,
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    {
      mineral: {
        id: newMineral.id,
        name: newMineral.name,
        chemicalFormula: newMineral.chemical_formula,
        isVariety: newMineral.is_variety ?? false,
        varietyOf: newMineral.variety_of,
        varietyOfMineral: newMineral.variety_of_mineral
          ? {
              id: (newMineral.variety_of_mineral as { id: string; name: string }).id,
              name: (newMineral.variety_of_mineral as { id: string; name: string }).name,
            }
          : null,
        status: newMineral.status,
        createdAt: newMineral.created_at,
      },
    },
    { status: 201 }
  )
}

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: submissions, error } = await supabase
    .from("minerals")
    .select("*, variety_of_mineral:variety_of(id, name)")
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const transformedSubmissions = (submissions || []).map((mineral) => ({
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
    status: mineral.status,
    createdAt: mineral.created_at,
  }))

  return NextResponse.json({ submissions: transformedSubmissions })
}
