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
  const status = searchParams.get("status") || "pending"

  const offset = (page - 1) * limit

  // Query minerals that were user-submitted
  let query = supabase
    .from("minerals")
    .select("*, variety_of_mineral:variety_of(id, name)", { count: "exact" })
    .not("submitted_by", "is", null)

  if (status !== "all") {
    query = query.eq("status", status)
  }

  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

  const { data: submissions, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Collect unique submitted_by IDs to fetch emails
  const submitterIds = [
    ...new Set((submissions || []).map((s) => s.submitted_by).filter(Boolean)),
  ]

  const emailMap: Record<string, string> = {}
  for (const id of submitterIds) {
    const { data } = await supabase.auth.admin.getUserById(id)
    if (data?.user?.email) {
      emailMap[id] = data.user.email
    }
  }

  // Transform
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
    submittedBy: mineral.submitted_by,
    submitterEmail: mineral.submitted_by ? emailMap[mineral.submitted_by] : undefined,
    status: mineral.status,
    adminNotes: mineral.admin_notes,
    reviewedBy: mineral.reviewed_by,
    reviewedAt: mineral.reviewed_at,
    createdAt: mineral.created_at,
  }))

  return NextResponse.json({
    submissions: transformedSubmissions,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}
