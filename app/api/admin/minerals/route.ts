import { createClient } from "@/lib/supabase/server"
import { checkAdminAuth } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

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
  const limit = parseInt(searchParams.get("limit") || "50")
  const search = searchParams.get("search") || ""

  const offset = (page - 1) * limit

  // Build main query for approved minerals
  let query = supabase
    .from("minerals")
    .select("*, variety_of_mineral:variety_of(id, name)", { count: "exact" })
    .eq("status", "approved")

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  query = query.order("name", { ascending: true }).range(offset, offset + limit - 1)

  const { data: minerals, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Calculate stats using count queries (avoids PostgREST default 1000 row limit)
  const [{ count: totalCount }, { count: varietyCount }] = await Promise.all([
    supabase
      .from("minerals")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("minerals")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("is_variety", true),
  ])

  const total = totalCount || 0
  const varieties = varietyCount || 0
  const nonVarieties = total - varieties

  // Transform snake_case to camelCase
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

  return NextResponse.json({
    minerals: transformedMinerals,
    stats: { total, nonVarieties, varieties },
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}
