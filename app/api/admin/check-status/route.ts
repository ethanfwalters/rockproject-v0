import { checkAdminAuth } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

/**
 * GET - Check current user's admin status
 * Used by the profile page to determine if the admin button should be shown
 */
export async function GET(request: Request) {
  const { isAdmin, isSuperAdmin, user, error: authError } = await checkAdminAuth()

  if (authError || !user) {
    return NextResponse.json(
      { isAdmin: false, isSuperAdmin: false, error: authError },
      { status: 401 }
    )
  }

  return NextResponse.json({ isAdmin, isSuperAdmin })
}
