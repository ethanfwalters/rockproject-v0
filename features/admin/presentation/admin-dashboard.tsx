"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/features/shared/presentation/card"
import { Button } from "@/features/shared/presentation/button"
import {
  Database,
  AlertTriangle,
  Users,
  Clock,
  UserPlus,
  Gem,
  MapPin,
  Loader2,
} from "lucide-react"
import { fetchDashboardStats } from "@/features/admin/application/client/statsClient"
import type { DashboardStats } from "@/features/admin/domain/types"

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load dashboard stats.")
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Platform overview and management</p>
        </div>
        <Card className="p-6 border-red-500/50 bg-red-500/5">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400">
                Failed to Load Stats
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {error || "Could not fetch dashboard statistics. Check the console for details."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Sort locality kinds by count descending for display
  const sortedLocalityKinds = Object.entries(stats.localityKindCounts).sort(
    ([, a], [, b]) => b - a
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Platform overview and management</p>
      </div>

      {/* Pending Minerals Alert */}
      {stats.pendingMineralsCount > 0 && (
        <Link href="/admin/minerals">
          <Card className="p-6 border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <Gem className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-700 dark:text-amber-400">
                    Minerals Pending Approval
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.pendingMineralsCount} mineral{stats.pendingMineralsCount !== 1 ? "s" : ""}{" "}
                    submitted by users {stats.pendingMineralsCount === 1 ? "needs" : "need"} review.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-sm font-bold h-8 min-w-8 px-2">
                {stats.pendingMineralsCount}
              </span>
            </div>
          </Card>
        </Link>
      )}

      {/* Platform Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Platform Overview</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Users This Month</p>
                <p className="text-3xl font-bold mt-2">{stats.newUsersThisMonth}</p>
              </div>
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Specimens</p>
                <p className="text-3xl font-bold mt-2">{stats.totalUserSpecimens}</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Specimens (24h)</p>
                <p className="text-3xl font-bold mt-2">{stats.specimensLast24h}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>
      </div>

      {/* Databases */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Databases</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Minerals Database */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Gem className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold">Minerals</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold mt-1">{stats.approvedMineralsCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Varieties</p>
                <p className="text-2xl font-bold mt-1">{stats.varietyMineralsCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-amber-500">
                  {stats.pendingMineralsCount}
                </p>
              </div>
            </div>
            <Link href="/admin/minerals" className="block mt-4">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Gem className="h-4 w-4" />
                Manage Minerals
              </Button>
            </Link>
          </Card>

          {/* Localities Database */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold">Localities</h3>
            </div>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Total Localities</p>
              <p className="text-2xl font-bold mt-1">{stats.totalLocalities}</p>
            </div>
            {sortedLocalityKinds.length > 0 && (
              <div className="space-y-2">
                {sortedLocalityKinds.map(([kind, count]) => (
                  <div key={kind} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{kind}s</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
