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

  // Get current user (optional - for identifying own specimens)
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch only public specimens that contain this mineral
  const { data: specimens } = await supabase
    .from("specimens")
    .select("id, image_url, created_at, mineral_ids, is_public, user_id")
    .contains("mineral_ids", [id])
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(20)

  // Get mineral names for all specimens
  const allMineralIds = new Set<string>()
  for (const spec of specimens || []) {
    if (spec.mineral_ids) {
      for (const mineralId of spec.mineral_ids) {
        allMineralIds.add(mineralId)
      }
    }
  }

  let mineralsMap: Record<string, { id: string; name: string }> = {}
  if (allMineralIds.size > 0) {
    const { data: minerals } = await supabase
      .from("minerals")
      .select("id, name")
      .in("id", Array.from(allMineralIds))

    if (minerals) {
      mineralsMap = minerals.reduce(
        (acc, m) => {
          acc[m.id] = { id: m.id, name: m.name }
          return acc
        },
        {} as Record<string, { id: string; name: string }>
      )
    }
  }

  const transformedSpecimens = (specimens || []).map((spec) => {
    const mineralIds = spec.mineral_ids || []
    const mineralsList = mineralIds.map((mid: string) => mineralsMap[mid]).filter(Boolean)

    return {
      id: spec.id,
      imageUrl: spec.image_url,
      createdAt: spec.created_at,
      minerals: mineralsList,
      isPublic: spec.is_public ?? false,
      isOwn: user ? spec.user_id === user.id : false,
    }
  })

  return NextResponse.json({
    mineral: {
      id: mineral.id,
      name: mineral.name,
      createdAt: mineral.created_at,
    },
    specimens: transformedSpecimens,
  })
}
