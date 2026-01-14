import type { Locality, LocalityWithAncestors, CreateLocalityInput } from "@/types/locality"

export async function fetchLocalities(params?: {
  parentId?: string
  kind?: string
  search?: string
  roots?: boolean
}): Promise<Locality[]> {
  const searchParams = new URLSearchParams()

  if (params?.parentId) {
    searchParams.set("parentId", params.parentId)
  }
  if (params?.kind) {
    searchParams.set("kind", params.kind)
  }
  if (params?.search) {
    searchParams.set("search", params.search)
  }
  if (params?.roots) {
    searchParams.set("roots", "true")
  }

  const url = `/api/localities${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch localities")
  }

  const data = await response.json()
  return data.localities
}

export async function fetchLocalityWithAncestors(id: string): Promise<LocalityWithAncestors> {
  const response = await fetch(`/api/localities/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch locality")
  }

  const data = await response.json()
  return data.locality
}

export async function createLocality(input: CreateLocalityInput): Promise<Locality> {
  const response = await fetch("/api/localities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Failed to create locality")
  }

  const data = await response.json()
  return data.locality
}

export async function updateLocality(
  id: string,
  input: Partial<CreateLocalityInput>
): Promise<Locality> {
  const response = await fetch(`/api/localities/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Failed to update locality")
  }

  const data = await response.json()
  return data.locality
}

export async function deleteLocality(id: string): Promise<void> {
  const response = await fetch(`/api/localities/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Failed to delete locality")
  }
}
