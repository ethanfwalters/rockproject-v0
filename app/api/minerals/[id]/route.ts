import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

type Params = Promise<{ id: string }>

export async function GET(request: Request, segmentData: { params: Params }) {
  const supabase = await createClient()
  const params = await segmentData.params
  const id = params.id

  // Try to fetch with variety info join first
  let mineral: Record<string, unknown> | null = null
  let error: { code?: string; message: string } | null = null

  const { data: mineralWithVariety, error: varietyError } = await supabase
    .from("minerals")
    .select("*, variety_of_mineral:variety_of(id, name)")
    .eq("id", id)
    .single()

  if (varietyError && varietyError.message?.includes("variety_of")) {
    // Fallback if variety_of column doesn't exist
    const { data: basicMineral, error: basicError } = await supabase
      .from("minerals")
      .select("*")
      .eq("id", id)
      .single()
    mineral = basicMineral
    error = basicError
  } else {
    mineral = mineralWithVariety
    error = varietyError
  }

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Mineral not found" }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!mineral) {
    return NextResponse.json({ error: "Mineral not found" }, { status: 404 })
  }

  // Fetch varieties of this mineral (minerals that have variety_of = this mineral's id)
  let varieties: Array<{ id: string; name: string }> = []
  try {
    const { data: varietiesData } = await supabase
      .from("minerals")
      .select("id, name")
      .eq("variety_of", id)
      .order("name", { ascending: true })

    if (varietiesData) {
      varieties = varietiesData
    }
  } catch {
    // variety_of column might not exist yet
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
      chemicalFormula: mineral.chemical_formula,
      isVariety: mineral.is_variety ?? false,
      varietyOf: mineral.variety_of ?? null,
      varietyOfMineral: mineral.variety_of_mineral
        ? {
            id: (mineral.variety_of_mineral as { id: string; name: string }).id,
            name: (mineral.variety_of_mineral as { id: string; name: string }).name,
          }
        : null,
      varieties,
      createdAt: mineral.created_at,
    },
    specimens: transformedSpecimens,
  })
}
