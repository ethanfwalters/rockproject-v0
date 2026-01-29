import type { AdminSpecimen, Pagination, SpecimenFormData } from "@/features/admin/domain/types"

interface FetchSpecimensParams {
  page: number
  limit: number
  search: string
  type: string
  sortBy: string
  sortOrder: string
}

interface FetchSpecimensResponse {
  specimens: AdminSpecimen[]
  pagination: Pagination
}

export async function fetchAdminSpecimens(params: FetchSpecimensParams): Promise<FetchSpecimensResponse> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    search: params.search,
    type: params.type,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  })

  const response = await fetch(`/api/admin/specimens?${searchParams}`)
  if (!response.ok) throw new Error("Failed to fetch specimens")
  return response.json()
}

export async function fetchAdminSpecimen(id: string) {
  const response = await fetch(`/api/admin/specimens/${id}`)
  if (!response.ok) throw new Error("Failed to fetch specimen")
  const data = await response.json()
  return data.specimen
}

export async function createAdminSpecimen(data: Record<string, unknown>) {
  const response = await fetch("/api/admin/specimens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || "Failed to create specimen")
  return result
}

export async function updateAdminSpecimen(id: string, data: Record<string, unknown>) {
  const response = await fetch(`/api/admin/specimens/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || "Failed to update specimen")
  return result
}

export async function deleteAdminSpecimen(id: string) {
  const response = await fetch(`/api/admin/specimens/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete specimen")
}

export function prepareSubmitData(formData: SpecimenFormData) {
  return {
    ...formData,
    common_locations: formData.common_locations
      ? formData.common_locations.split(",").map((s) => s.trim()).filter(Boolean)
      : null,
  }
}
