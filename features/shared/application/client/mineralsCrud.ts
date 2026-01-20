import type { Mineral, CreateMineralInput } from "@/types/mineral"

export async function fetchMinerals(search?: string): Promise<Mineral[]> {
  const params = new URLSearchParams()
  if (search) {
    params.set("search", search)
  }

  const url = `/api/minerals${params.toString() ? `?${params.toString()}` : ""}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch minerals")
  }

  const data = await response.json()
  return data.minerals
}

export async function createMineral(input: CreateMineralInput): Promise<Mineral> {
  const response = await fetch("/api/minerals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      chemicalFormula: input.chemicalFormula,
      isVariety: input.isVariety,
      varietyOf: input.varietyOf,
    }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Failed to create mineral")
  }

  const data = await response.json()
  return data.mineral
}
