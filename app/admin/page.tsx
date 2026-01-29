import { AdminDashboard } from "@/features/admin/presentation/admin-dashboard"
import { fetchDashboardStats } from "@/features/admin/application/client/statsClient"

export default async function AdminDashboardPage() {
  const stats = await fetchDashboardStats()

  return <AdminDashboard stats={stats} />
}
