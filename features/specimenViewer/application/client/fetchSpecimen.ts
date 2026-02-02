import type { Specimen } from "@/types/specimen"

export type SpecimenResponse = {
  specimen: Specimen
  isOwner: boolean
}

export async function fetchSpecimenById(id: string): Promise<SpecimenResponse> {
  const response = await fetch(`/api/specimens/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch specimen")
  }
  const data = await response.json()
  return { specimen: data.specimen, isOwner: data.isOwner }
}
