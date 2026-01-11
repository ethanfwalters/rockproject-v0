"use client"

import type { Specimen } from "@/types/specimen"
import { Card } from "@/features/shared/presentation/card"
import { TrendingUp, Calendar, MapPin, Sparkles } from "lucide-react"
import { useMemo } from "react"
import { CollectionMap } from "./collection-map"

interface CollectionStatsProps {
  specimens: Specimen[]
}

export function CollectionStats({ specimens }: CollectionStatsProps) {
  const stats = useMemo(() => {
    if (specimens.length === 0) {
      return {
        total: 0,
        minerals: 0,
        rocks: 0,
        fossils: 0,
        mostCommonType: "None",
        uniqueLocations: 0,
        recentAdditions: [],
        oldestSpecimen: null,
      }
    }

    const typeCount = specimens.reduce(
      (acc, s) => {
        acc[s.type]++
        return acc
      },
      { mineral: 0, rock: 0, fossil: 0 },
    )

    const mostCommonType = Object.entries(typeCount).reduce((a, b) => (b[1] > a[1] ? b : a))[0]

    const uniqueLocations = new Set(specimens.filter((s) => s.location).map((s) => s.location)).size

    const sortedByDate = [...specimens].sort(
      (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
    )
    const recentAdditions = sortedByDate.slice(0, 5)

    const oldestSpecimen = specimens.reduce((oldest, current) => {
      return new Date(current.dateAdded) < new Date(oldest.dateAdded) ? current : oldest
    })

    return {
      total: specimens.length,
      minerals: typeCount.mineral,
      rocks: typeCount.rock,
      fossils: typeCount.fossil,
      mostCommonType: mostCommonType.charAt(0).toUpperCase() + mostCommonType.slice(1),
      uniqueLocations,
      recentAdditions,
      oldestSpecimen,
    }
  }, [specimens])

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? "s" : ""} ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-4 lg:sticky lg:top-20">
      <h2 className="text-2xl font-bold">Collection Stats</h2>

      {/* Total Collection Card */}
      <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Collection</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
        </div>
      </Card>

      <div className="relative z-0">
        <CollectionMap specimens={specimens} />
      </div>

      {/* Type Breakdown */}
      <Card className="border-0 bg-card p-6">
        <h3 className="mb-4 font-semibold">By Type</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Minerals</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${stats.total > 0 ? (stats.minerals / stats.total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm font-medium">{stats.minerals}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rocks</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${stats.total > 0 ? (stats.rocks / stats.total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm font-medium">{stats.rocks}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Fossils</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${stats.total > 0 ? (stats.fossils / stats.total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm font-medium">{stats.fossils}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <p className="text-xs">Most Common</p>
          </div>
          <p className="text-lg font-bold">{stats.mostCommonType}</p>
        </Card>

        <Card className="border-0 bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <p className="text-xs">Locations</p>
          </div>
          <p className="text-lg font-bold">{stats.uniqueLocations}</p>
        </Card>
      </div>

      <Card className="border-0 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {stats.recentAdditions.length > 0 ? (
            stats.recentAdditions.map((specimen) => (
              <div key={specimen.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">
                    {specimen.type === "mineral" ? "💎" : specimen.type === "rock" ? "🪨" : "🦴"}
                  </span>
                  <span className="text-sm font-medium truncate">{specimen.name}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatRelativeTime(specimen.dateAdded)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No specimens yet</p>
          )}
        </div>
      </Card>
    </div>
  )
}
