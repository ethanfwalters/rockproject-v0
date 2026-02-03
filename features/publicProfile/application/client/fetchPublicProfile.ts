import type { PublicProfileData } from "../../domain/types"

export async function fetchPublicProfile(
  username: string
): Promise<PublicProfileData> {
  const response = await fetch(`/api/profile/${encodeURIComponent(username)}`)
  if (response.status === 404) {
    throw new NotFoundError("User not found")
  }
  if (!response.ok) {
    throw new Error("Failed to fetch profile")
  }
  return response.json()
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NotFoundError"
  }
}
