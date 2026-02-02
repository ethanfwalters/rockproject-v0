import type { PublicMapSpecimen } from "@/features/exploreMap/domain/types"

export async function fetchPublicMapSpecimens(): Promise<PublicMapSpecimen[]> {
  const response = await fetch("/api/specimens/public-map")

  if (!response.ok) {
    throw new Error("Failed to fetch public map specimens")
  }

  const data = await response.json()
  return data.specimens
}
