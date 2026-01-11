"use client"

import { useState, useRef, type ChangeEvent, type DragEvent } from "react"
import { Button } from "./button"
import { Card } from "./card"
import { Label } from "./label"
import { useImageUpload } from "../hooks/useImageUpload"
import { MAX_FILE_SIZE_MB } from "@/lib/s3/constants"

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUrlChange: (url: string | null) => void
  disabled?: boolean
}

export function ImageUpload({ currentImageUrl, onImageUrlChange, disabled = false }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadImage, deleteImage, isUploading, error, progress } = useImageUpload()

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Validate file
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      alert(`File size exceeds maximum of ${MAX_FILE_SIZE_MB}MB`)
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only JPEG, PNG, and WebP are allowed")
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle file input change
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle upload button click
  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      const fileUrl = await uploadImage(selectedFile)
      onImageUrlChange(fileUrl)
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch (err) {
      // Error is already handled by the hook
      console.error("Upload failed:", err)
    }
  }

  // Handle delete button click
  const handleDelete = async () => {
    if (!currentImageUrl) return

    try {
      await deleteImage(currentImageUrl)
      onImageUrlChange(null)
    } catch (err) {
      // Error is already handled by the hook
      console.error("Delete failed:", err)
    }
  }

  // Handle cancel selection
  const handleCancel = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const displayImageUrl = previewUrl || currentImageUrl

  return (
    <div className="space-y-4">
      <Label>Specimen Image</Label>

      {/* Image Preview */}
      {displayImageUrl && (
        <Card className="overflow-hidden">
          <div className="relative h-64 bg-muted">
            <img src={displayImageUrl} alt="Specimen preview" className="h-full w-full object-cover" />
          </div>
        </Card>
      )}

      {/* Upload Area */}
      {!selectedFile && !currentImageUrl && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <svg
              className="h-12 w-12 text-muted-foreground"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP (max. {MAX_FILE_SIZE_MB}MB)</p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Action Buttons */}
      <div className="flex gap-2">
        {selectedFile && !isUploading && (
          <>
            <Button onClick={handleUpload} disabled={disabled} className="flex-1">
              Upload Image
            </Button>
            <Button onClick={handleCancel} variant="outline" disabled={disabled}>
              Cancel
            </Button>
          </>
        )}

        {currentImageUrl && !selectedFile && (
          <>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={disabled}>
              Change Image
            </Button>
            <Button onClick={handleDelete} variant="outline" disabled={disabled}>
              Remove Image
            </Button>
          </>
        )}
      </div>

      {/* Progress indicator */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}
