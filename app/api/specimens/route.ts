import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: specimens, error } = await supabase
    .from("specimens")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const transformedSpecimens = specimens.map((spec) => ({
    id: spec.id,
    name: spec.name,
    type: spec.type,
    imageUrl: spec.image_url,
    dateAdded: spec.acquisition_date || spec.created_at.split("T")[0],
    location: spec.location,
    description: spec.description,
    details: {
      hardness: spec.hardness?.toString(),
      composition: spec.composition,
      color: spec.color,
      luster: spec.luster,
      weight: spec.weight?.toString(),
      dimensions: spec.dimensions,
    },
  }))

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
    name: body.name,
    type: body.type,
    location: body.location,
    description: body.description,
    hardness: body.details?.hardness ? Number.parseFloat(body.details.hardness) : null,
    luster: body.details?.luster,
    color: body.details?.color,
    composition: body.details?.composition,
    weight: body.details?.weight ? Number.parseFloat(body.details.weight) : null,
    dimensions: body.details?.dimensions,
    image_url: body.imageUrl,
    acquisition_date: body.dateAdded || new Date().toISOString().split("T")[0],
  }

  const { data: newSpecimen, error } = await supabase.from("specimens").insert(specimenData).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const transformedSpecimen = {
    id: newSpecimen.id,
    name: newSpecimen.name,
    type: newSpecimen.type,
    imageUrl: newSpecimen.image_url,
    dateAdded: newSpecimen.acquisition_date || newSpecimen.created_at.split("T")[0],
    location: newSpecimen.location,
    description: newSpecimen.description,
    details: {
      hardness: newSpecimen.hardness?.toString(),
      composition: newSpecimen.composition,
      color: newSpecimen.color,
      luster: newSpecimen.luster,
      weight: newSpecimen.weight?.toString(),
      dimensions: newSpecimen.dimensions,
    },
  }

  return NextResponse.json({ specimen: transformedSpecimen })
}
