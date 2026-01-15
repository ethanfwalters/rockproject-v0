import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

type Params = Promise<{ id: string }>

export async function GET(request: Request, segmentData: { params: Params }) {
  const supabase = await createClient()
  const params = await segmentData.params
  const id = params.id

  const { data: mineral, error } = await supabase
    .from("minerals")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Mineral not found" }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    mineral: {
      id: mineral.id,
      name: mineral.name,
      createdAt: mineral.created_at,
    },
  })
}
