"use client"

import Link from "next/link"
import {
  Sparkles,
  Plus,
  LayoutGrid,
  MapPin,
  TrendingUp,
  ArrowRight,
  Clock,
  Users,
  Star
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Navbar } from "@/features/navbar/presentation/navbar"
import { Button } from "@/features/shared/presentation/button"
import { Card } from "@/features/shared/presentation/card"
import { SpecimenCard, SpecimenCardLoading, SpecimenCardEmpty } from "@/features/shared/presentation/specimen-card"
import { fetchRecentSpecimens } from "@/features/homepage/application/client/recentSpecimens"

const TILE_COUNT = 4

// Mock data for trending minerals
const trendingMinerals = [
  { name: "Fluorite", count: 342, trend: "+18%" },
  { name: "Quartz", count: 287, trend: "+12%" },
  { name: "Pyrite", count: 156, trend: "+24%" },
  { name: "Calcite", count: 134, trend: "+9%" },
  { name: "Amethyst", count: 98, trend: "+31%" }
]

// Mock data for featured localities
const featuredLocalities = [
  { name: "Rogerley Mine", country: "England", specimens: 1240 },
  { name: "Navajún", country: "Spain", specimens: 892 },
  { name: "Sweet Home Mine", country: "Colorado, USA", specimens: 756 },
  { name: "Minas Gerais", country: "Brazil", specimens: 2341 }
]


interface AuthenticatedHomepageProps {
  userEmail: string
  username?: string | null
}

export function AuthenticatedHomepage({ userEmail, username }: AuthenticatedHomepageProps) {
  const userName = username || userEmail.split("@")[0]

  const { data: recentSpecimens = [], isLoading } = useQuery({
    queryKey: ["recentSpecimens"],
    queryFn: fetchRecentSpecimens,
  })

  // Pad to TILE_COUNT with empty slots
  const tiles = Array.from({ length: TILE_COUNT }, (_, i) => recentSpecimens[i] ?? null)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                Welcome back, {userName}
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening in the mineral collecting community today.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-xl gap-2">
              <Link href="/collection">
                <Plus className="h-5 w-5" />
                Add Specimen
              </Link>
            </Button>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/collection" className="group">
              <Card className="p-6 hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <LayoutGrid className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Your Collection</h3>
                    <p className="text-sm text-muted-foreground">View and manage your specimens</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
            </Link>

            <Link href="/collection?view=map" className="group">
              <Card className="p-6 hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Collection Map</h3>
                    <p className="text-sm text-muted-foreground">See specimens on a map</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
            </Link>

            <Link href="/localities" className="group">
              <Card className="p-6 hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Explore Localities</h3>
                    <p className="text-sm text-muted-foreground">Discover new collecting sites</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
            </Link>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recently Added by Community */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Recently Added
                </h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  View all
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {isLoading
                  ? Array.from({ length: TILE_COUNT }).map((_, i) => (
                      <SpecimenCardLoading key={i} />
                    ))
                  : tiles.map((specimen, i) =>
                      specimen ? (
                        <SpecimenCard
                          key={specimen.id}
                          name={specimen.name}
                          imageUrl={specimen.imageUrl}
                          locality={specimen.locality}
                          dateAdded={specimen.createdAt}
                          showAuthor
                          author={specimen.addedBy}
                          href={`/specimen/${specimen.id}`}
                        />
                      ) : (
                        <SpecimenCardEmpty key={`empty-${i}`} />
                      )
                    )}
              </div>
            </section>

            {/* Featured Localities */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-muted-foreground" />
                  Featured Localities
                </h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Explore all
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {featuredLocalities.map((locality) => (
                  <Card
                    key={locality.name}
                    className="p-5 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{locality.name}</h3>
                        <p className="text-sm text-muted-foreground">{locality.country}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {locality.specimens.toLocaleString()} specimens catalogued
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Stats & Trending */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                Community Stats
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Total Specimens</span>
                  <span className="font-semibold">12,847</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Active Collectors</span>
                  <span className="font-semibold">2,543</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Localities</span>
                  <span className="font-semibold">1,892</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Mineral Types</span>
                  <span className="font-semibold">547</span>
                </div>
              </div>
            </Card>

            {/* Trending Minerals */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                Trending This Week
              </h2>
              <div className="space-y-3">
                {trendingMinerals.map((mineral, index) => (
                  <div
                    key={mineral.name}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-medium text-muted-foreground w-5">
                      {index + 1}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {mineral.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{mineral.name}</p>
                      <p className="text-xs text-muted-foreground">{mineral.count} specimens</p>
                    </div>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      {mineral.trend}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Tips */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Pro Tip</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Add photos from multiple angles to help identify your specimens.
                    Including a scale reference makes your catalog more valuable.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-primary-foreground"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span className="font-semibold">Terralis</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 Terralis. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
