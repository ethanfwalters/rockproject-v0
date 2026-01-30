import type {
  AdminMineral,
  AdminMineralsStats,
  Pagination,
  SubmittedMineral,
} from "@/features/admin/domain/types"

interface FetchAdminMineralsParams {
  search?: string
  page?: number
  limit?: number
}

interface FetchAdminMineralsResponse {
  minerals: AdminMineral[]
  stats: AdminMineralsStats
  pagination: Pagination
}

export async function fetchAdminMinerals(
  params: FetchAdminMineralsParams
): Promise<FetchAdminMineralsResponse> {
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set("search", params.search)
  if (params.page) searchParams.set("page", params.page.toString())
  if (params.limit) searchParams.set("limit", params.limit.toString())

  const response = await fetch(`/api/admin/minerals?${searchParams}`)
  if (!response.ok) throw new Error("Failed to fetch minerals")
  return response.json()
}

interface FetchSubmittedMineralsParams {
  status?: string
  page?: number
  limit?: number
}

interface FetchSubmittedMineralsResponse {
  submissions: SubmittedMineral[]
  pagination: Pagination
}

export async function fetchSubmittedMinerals(
  params: FetchSubmittedMineralsParams
): Promise<FetchSubmittedMineralsResponse> {
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.set("status", params.status)
  if (params.page) searchParams.set("page", params.page.toString())
  if (params.limit) searchParams.set("limit", params.limit.toString())

  const response = await fetch(`/api/admin/submitted-minerals?${searchParams}`)
  if (!response.ok) throw new Error("Failed to fetch submitted minerals")
  return response.json()
}

export async function reviewMineral(
  id: string,
  body: { status: string; adminNotes?: string }
) {
  const response = await fetch(`/api/admin/minerals/${id}/review`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || "Failed to review mineral")
  return result
}
