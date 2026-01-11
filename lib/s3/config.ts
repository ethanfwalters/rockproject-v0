import { S3Client } from "@aws-sdk/client-s3"

// Validate required environment variables
const requiredEnvVars = {
  region: process.env.AWS_S3_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucketName: process.env.AWS_S3_BUCKET_NAME,
}

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  throw new Error(`Missing required S3 environment variables: ${missingVars.join(", ")}`)
}

// Initialize S3 client with credentials
export const s3Client = new S3Client({
  region: requiredEnvVars.region!,
  credentials: {
    accessKeyId: requiredEnvVars.accessKeyId!,
    secretAccessKey: requiredEnvVars.secretAccessKey!,
  },
})

// Export S3 configuration constants
export const S3_CONFIG = {
  bucketName: requiredEnvVars.bucketName!,
  region: requiredEnvVars.region!,
  baseUrl: process.env.NEXT_PUBLIC_AWS_S3_BASE_URL || `https://${requiredEnvVars.bucketName}.s3.${requiredEnvVars.region}.amazonaws.com`,
}

// Type definitions for S3 operations
export interface S3UploadResponse {
  uploadUrl: string
  fileUrl: string
  key: string
}

export interface S3DeleteRequest {
  imageUrl: string
}
