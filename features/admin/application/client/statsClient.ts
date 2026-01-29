import type { DashboardStats } from "@/features/admin/domain/types"

export async function fetchDashboardStats(): Promise<DashboardStats | null> {
  try {
    const response = await fetch("/api/admin/stats", { cache: "no-store" })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return null
  }
}
