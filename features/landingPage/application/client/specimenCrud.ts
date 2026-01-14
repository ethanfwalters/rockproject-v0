import type { Specimen, CreateSpecimenInput, UpdateSpecimenInput } from "@/types/specimen"

export async function fetchSpecimens(): Promise<Specimen[]> {
  const response = await fetch("/api/specimens")
  if (response.status === 401) {
    throw new Error("Unauthorized")
  }
  const data = await response.json()
  return data.specimens
}

export async function addSpecimen(specimen: CreateSpecimenInput): Promise<Specimen> {
  const response = await fetch("/api/specimens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(specimen),
  })
  const data = await response.json()
  return data.specimen
}

export async function updateSpecimen(specimen: UpdateSpecimenInput): Promise<Specimen> {
  const response = await fetch("/api/specimens", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(specimen),
  })
  const data = await response.json()
  return data.specimen
}

export async function deleteSpecimen(id: string): Promise<void> {
  await fetch(`/api/specimens?id=${id}`, {
    method: "DELETE",
  })
}
