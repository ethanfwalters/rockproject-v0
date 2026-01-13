import Link from "next/link"
import { Card } from "@/features/shared/presentation/card"
import { Button } from "@/features/shared/presentation/button"
import { Database, Upload, Plus, AlertTriangle } from "lucide-react"

async function getStats() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000"}/api/admin/stats`, {
      cache: "no-store",
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return null
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your specimen reference database</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Specimens</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalCount || 0}</p>
            </div>
            <Database className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Minerals</p>
              <p className="text-3xl font-bold mt-2">{stats?.typeCounts?.mineral || 0}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <span className="text-blue-500 text-lg">💎</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rocks</p>
              <p className="text-3xl font-bold mt-2">{stats?.typeCounts?.rock || 0}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="text-green-500 text-lg">🪨</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Fossils</p>
              <p className="text-3xl font-bold mt-2">{stats?.typeCounts?.fossil || 0}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <span className="text-amber-500 text-lg">🦴</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/specimens/add">
            <Button className="w-full gap-2" size="lg">
              <Plus className="h-5 w-5" />
              Add New Specimen
            </Button>
          </Link>
          <Link href="/admin/specimens">
            <Button variant="outline" className="w-full gap-2" size="lg">
              <Database className="h-5 w-5" />
              View All Specimens
            </Button>
          </Link>
          <Link href="/admin/import">
            <Button variant="outline" className="w-full gap-2" size="lg">
              <Upload className="h-5 w-5" />
              Bulk Import
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recently Added */}
      {stats?.recentlyAdded && stats.recentlyAdded.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recently Added</h2>
          <div className="space-y-3">
            {stats.recentlyAdded.slice(0, 5).map((specimen: any) => (
              <div key={specimen.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium capitalize">{specimen.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{specimen.type}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(specimen.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Missing Data Warning */}
      {stats?.missingData && (stats.missingData.hardness > 0 || stats.missingData.composition > 0) && (
        <Card className="p-6 border-amber-500/50 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-amber-700 dark:text-amber-400">Missing Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Some specimens are missing important data:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                {stats.missingData.hardness > 0 && (
                  <li>• {stats.missingData.hardness} specimens missing hardness</li>
                )}
                {stats.missingData.composition > 0 && (
                  <li>• {stats.missingData.composition} specimens missing composition</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
