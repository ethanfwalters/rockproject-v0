import { useQuery } from "@tanstack/react-query"

export type AppUser = {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  specimen_count: number
}

export type AppUsersStats = {
  totalUsers: number
  usersWithSpecimens: number
  newUsersThisMonth: number
  totalSpecimens: number
}

export type AppUsersResponse = {
  users: AppUser[]
  stats: AppUsersStats
}

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
