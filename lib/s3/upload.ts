import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Client, S3_CONFIG, type S3UploadResponse } from "./config"
import { MAX_FILE_SIZE_MB, ALLOWED_MIME_TYPES } from "./constants"

/**
 * Validates file type and size constraints
 */
export function validateFile(fileName: string, fileType: string, fileSizeMB?: number): { valid: boolean; error?: string } {
  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(fileType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
    }
  }

  // Validate file size if provided
  if (fileSizeMB !== undefined && fileSizeMB > MAX_FILE_SIZE_MB) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${MAX_FILE_SIZE_MB}MB`,
    }
  }

  return { valid: true }
}

/**
 * Generates a unique S3 key for uploaded files
 * Format: {userId}/{timestamp}-{uuid}.{ext}
 */
export function generateUniqueKey(userId: string, fileName: string): string {
  // Extract file extension
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg"

  // Generate unique identifier
  const timestamp = Date.now()
  const uuid = crypto.randomUUID()

  // Create key with user folder structure
  return `${userId}/${timestamp}-${uuid}.${extension}`
}

/**
 * Extracts S3 key from a full S3 URL
 */
export function extractS3Key(url: string): string | null {
  try {
    const urlObj = new URL(url)
    // Remove leading slash from pathname
    return urlObj.pathname.substring(1)
  } catch {
    return null
  }
}

/**
 * Generates a presigned URL for uploading to S3
 */
export async function generatePresignedUrl(
  fileName: string,
  fileType: string,
  userId: string,
  fileSizeMB?: number
): Promise<S3UploadResponse> {
  // Validate file
  const validation = validateFile(fileName, fileType, fileSizeMB)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Generate unique key
  const key = generateUniqueKey(userId, fileName)

  // Create PutObjectCommand
  const command = new PutObjectCommand({
    Bucket: S3_CONFIG.bucketName,
    Key: key,
    ContentType: fileType,
  })

  // Generate presigned URL (expires in 5 minutes)
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

  // Construct the final file URL
  const fileUrl = `${S3_CONFIG.baseUrl}/${key}`

  return {
    uploadUrl,
    fileUrl,
    key,
  }
}

/**
 * Deletes an image from S3
 */
export async function deleteFromS3(imageUrl: string): Promise<void> {
  // Extract S3 key from URL
  const key = extractS3Key(imageUrl)
  if (!key) {
    throw new Error("Invalid S3 URL")
  }

  // Create DeleteObjectCommand
  const command = new DeleteObjectCommand({
    Bucket: S3_CONFIG.bucketName,
    Key: key,
  })

  // Execute deletion
  await s3Client.send(command)
}
