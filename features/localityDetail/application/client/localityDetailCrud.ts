import type { LocalityDetail } from "@/types/locality"
import type { FetchLocalityDetailOptions } from "../../domain/types"

export async function fetchLocalityDetail(
  id: string,
  options: FetchLocalityDetailOptions = {}
): Promise<LocalityDetail> {
  const params = new URLSearchParams()

  if (options.includeChildren) {
    params.set("includeChildren", "true")
  }
  if (options.includeSpecimens) {
    params.set("includeSpecimens", "true")
  }
  if (options.includeChildrenSpecimens) {
    params.set("includeChildrenSpecimens", "true")
  }

  const queryString = params.toString()
  const url = `/api/localities/${id}${queryString ? `?${queryString}` : ""}`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Locality not found")
    }
    throw new Error("Failed to fetch locality")
  }

  const data = await response.json()

  return {
    locality: data.locality,
    children: data.children || [],
    specimens: data.specimens || [],
    specimenCount: data.specimenCount || 0,
  }
}
