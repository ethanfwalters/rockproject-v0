import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { deleteFromS3 } from "@/lib/s3/upload"

export async function DELETE(request: Request) {
  try {
    // Validate user authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { imageUrl } = body

    // Validate required fields
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 })
    }

    // Delete from S3
    await deleteFromS3(imageUrl)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image from S3:", error)

    // Return user-friendly error message
    const errorMessage = error instanceof Error ? error.message : "Failed to delete image"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
