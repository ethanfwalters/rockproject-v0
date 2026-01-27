import { useQuery } from "@tanstack/react-query"
import type { AppUsersResponse } from "../../domain/types"

/**
 * Fetch all app users with stats
 */
export async function fetchAppUsers(): Promise<AppUsersResponse> {
  const response = await fetch("/api/admin/app-users")
  if (!response.ok) {
    throw new Error("Failed to fetch app users")
  }
  return await response.json()
}

/**
 * React Query hook to fetch app users
 */
export function useAppUsers() {
  return useQuery({
    queryKey: ["app-users"],
    queryFn: fetchAppUsers,
  })
}
