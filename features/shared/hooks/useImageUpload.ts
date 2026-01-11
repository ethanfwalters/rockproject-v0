"use client"

import { useState } from "react"
import { MAX_FILE_SIZE_MB } from "@/lib/s3/constants"

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<string>
  deleteImage: (imageUrl: string) => Promise<void>
  isUploading: boolean
  error: string | null
  progress: number
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true)
    setError(null)
    setProgress(0)

    try {
      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE_MB}MB`)
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed")
      }

      // Step 1: Request presigned URL from API
      setProgress(20)
      const presignedResponse = await fetch("/api/specimens/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSizeMB,
        }),
      })

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json()
        throw new Error(errorData.error || "Failed to get upload URL")
      }

      const { uploadUrl, fileUrl } = await presignedResponse.json()

      // Step 2: Upload file directly to S3
      setProgress(40)
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to S3")
      }

      // Step 3: Return the file URL
      setProgress(100)
      return fileUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload image"
      setError(errorMessage)
      throw err
    } finally {
      setIsUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const deleteImage = async (imageUrl: string): Promise<void> => {
    setError(null)

    try {
      const response = await fetch("/api/specimens/delete-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete image")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete image"
      setError(errorMessage)
      throw err
    }
  }

  return {
    uploadImage,
    deleteImage,
    isUploading,
    error,
    progress,
  }
}
