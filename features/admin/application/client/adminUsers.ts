import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export type AdminUser = {
  id: string
  user_id: string
  email: string
  is_super_admin: boolean
  granted_at: string
  created_at: string
}

/**
 * Fetch all admin users
 */
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await fetch("/api/admin/users")
  if (!response.ok) {
    throw new Error("Failed to fetch admin users")
  }
  const data = await response.json()
  return data.admins
}

/**
 * Add a new admin user
 */
export async function addAdminUser(email: string, isSuperAdmin: boolean = false): Promise<AdminUser> {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, is_super_admin: isSuperAdmin }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to add admin user")
  }
  const data = await response.json()
  return data.admin
}

/**
 * Remove an admin user
 */
export async function removeAdminUser(id: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to remove admin user")
  }
}

/**
 * Toggle super admin status for a user
 */
export async function toggleSuperAdmin(id: string, isSuperAdmin: boolean): Promise<AdminUser> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_super_admin: isSuperAdmin }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update admin user")
  }
  const data = await response.json()
  return data.admin
}

/**
 * React Query hook to fetch admin users
 */
export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  })
}

/**
 * React Query hook to add an admin user
 */
export function useAddAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, isSuperAdmin }: { email: string; isSuperAdmin: boolean }) =>
      addAdminUser(email, isSuperAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

/**
 * React Query hook to remove an admin user
 */
export function useRemoveAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

/**
 * React Query hook to toggle super admin status
 */
export function useToggleSuperAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isSuperAdmin }: { id: string; isSuperAdmin: boolean }) =>
      toggleSuperAdmin(id, isSuperAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}
