import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")

  let query = supabase.from("minerals").select("*").order("name", { ascending: true })

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  const { data: minerals, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const transformedMinerals = minerals.map((mineral) => ({
    id: mineral.id,
    name: mineral.name,
    chemicalFormula: mineral.chemical_formula,
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

  const insertData: { name: string; chemical_formula?: string } = {
    name: body.name.trim(),
  }

  if (body.chemicalFormula && typeof body.chemicalFormula === "string") {
    insertData.chemical_formula = body.chemicalFormula.trim()
  }

  const { data: newMineral, error } = await supabase
    .from("minerals")
    .insert(insertData)
    .select()
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
      createdAt: newMineral.created_at,
    },
  })
}
