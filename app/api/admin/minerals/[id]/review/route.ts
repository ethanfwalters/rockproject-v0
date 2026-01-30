import { createClient } from "@/lib/supabase/server"
import { checkAdminAuth } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

type Params = Promise<{ id: string }>

export async function PUT(request: Request, segmentData: { params: Params }) {
  const { isAdmin, user, error: authError } = await checkAdminAuth()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  const supabase = await createClient()
  const params = await segmentData.params
  const id = params.id

  const body = await request.json()

  if (!body.status || !["approved", "rejected"].includes(body.status)) {
    return NextResponse.json({ error: "Status must be 'approved' or 'rejected'" }, { status: 400 })
  }

  const { data: updatedMineral, error } = await supabase
    .from("minerals")
    .update({
      status: body.status,
      admin_notes: body.adminNotes || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, variety_of_mineral:variety_of(id, name)")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    mineral: {
      id: updatedMineral.id,
      name: updatedMineral.name,
      chemicalFormula: updatedMineral.chemical_formula,
      isVariety: updatedMineral.is_variety ?? false,
      varietyOf: updatedMineral.variety_of ?? null,
      varietyOfMineral: updatedMineral.variety_of_mineral
        ? {
            id: (updatedMineral.variety_of_mineral as { id: string; name: string }).id,
            name: (updatedMineral.variety_of_mineral as { id: string; name: string }).name,
          }
        : null,
      status: updatedMineral.status,
      adminNotes: updatedMineral.admin_notes,
      reviewedBy: updatedMineral.reviewed_by,
      reviewedAt: updatedMineral.reviewed_at,
      createdAt: updatedMineral.created_at,
    },
  })
}
