import { createClient } from "@/lib/supabase/server"
import { checkAdminAuth } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

// POST - Bulk import specimens
export async function POST(request: Request) {
  const { isAdmin, user, error: authError } = await checkAdminAuth()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  const supabase = await createClient()

  const body = await request.json()
  const { specimens, skipDuplicates = true } = body

  if (!Array.isArray(specimens) || specimens.length === 0) {
    return NextResponse.json({ error: "specimens array is required and must not be empty" }, { status: 400 })
  }

  const results = {
    total: specimens.length,
    imported: 0,
    skipped: 0,
    errors: [] as Array<{ row: number; name: string; error: string }>,
  }

  for (let i = 0; i < specimens.length; i++) {
    const spec = specimens[i]

    // Validate required fields
    if (!spec.name || !spec.type) {
      results.errors.push({
        row: i + 1,
        name: spec.name || "unnamed",
        error: "Name and type are required",
      })
      continue
    }

    // Validate type
    if (!["mineral", "rock", "fossil"].includes(spec.type)) {
      results.errors.push({
        row: i + 1,
        name: spec.name,
        error: "Type must be mineral, rock, or fossil",
      })
      continue
    }

    const specimenData = {
      name: spec.name.toLowerCase().trim(),
      type: spec.type,
      hardness: spec.hardness || null,
      luster: spec.luster || null,
      composition: spec.composition || null,
      streak: spec.streak || null,
      color: spec.color || null,
      crystal_system: spec.crystal_system || null,
      cleavage: spec.cleavage || null,
      fracture: spec.fracture || null,
      specific_gravity: spec.specific_gravity || null,
      description: spec.description || null,
      common_locations: spec.common_locations || null,
    }

    if (skipDuplicates) {
      // Use upsert to skip duplicates
      const { error } = await supabase
        .from("specimen_reference")
        .upsert(specimenData, { onConflict: "name", ignoreDuplicates: true })

      if (error) {
        if (error.code === "23505") {
          results.skipped++
        } else {
          results.errors.push({
            row: i + 1,
            name: spec.name,
            error: error.message,
          })
        }
      } else {
        results.imported++
      }
    } else {
      // Regular insert
      const { error } = await supabase.from("specimen_reference").insert(specimenData)

      if (error) {
        if (error.code === "23505") {
          results.errors.push({
            row: i + 1,
            name: spec.name,
            error: "Duplicate: A specimen with this name already exists",
          })
        } else {
          results.errors.push({
            row: i + 1,
            name: spec.name,
            error: error.message,
          })
        }
      } else {
        results.imported++
      }
    }
  }

  return NextResponse.json({
    success: results.errors.length === 0,
    results,
  })
}
