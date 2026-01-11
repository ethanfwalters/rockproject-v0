import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { generatePresignedUrl } from "@/lib/s3/upload"

export async function POST(request: Request) {
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
    const { fileName, fileType, fileSizeMB } = body

    // Validate required fields
    if (!fileName || !fileType) {
      return NextResponse.json({ error: "fileName and fileType are required" }, { status: 400 })
    }

    // Generate presigned URL using S3 utility
    const uploadData = await generatePresignedUrl(fileName, fileType, user.id, fileSizeMB)

    return NextResponse.json(uploadData)
  } catch (error) {
    console.error("Error generating presigned URL:", error)

    // Return user-friendly error message
    const errorMessage = error instanceof Error ? error.message : "Failed to generate upload URL"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
