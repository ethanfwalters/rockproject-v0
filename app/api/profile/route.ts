import { createClient } from "@/lib/supabase/server"
import { UsernameSchema } from "@/types/profile"
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

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ profile: null })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    profile: {
      id: profile.id,
      userId: profile.user_id,
      username: profile.username,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
  })
}

export async function PUT(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const result = UsernameSchema.safeParse(body.username)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    )
  }

  const username = result.data

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ username, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .select("*")
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This username is already taken" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    profile: {
      id: profile.id,
      userId: profile.user_id,
      username: profile.username,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
  })
}
