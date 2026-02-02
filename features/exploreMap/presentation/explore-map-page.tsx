"use client"

import { useQuery } from "@tanstack/react-query"
import { MapPin } from "lucide-react"
import { Navbar } from "@/features/navbar/presentation/navbar"
import { fetchPublicMapSpecimens } from "../application/client/publicMapSpecimens"
import { ExploreMap } from "./explore-map"

export function ExploreMapPage() {
  const { data: specimens = [], isLoading, isError } = useQuery({
    queryKey: ["publicMapSpecimens"],
    queryFn: fetchPublicMapSpecimens,
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary" />
            Community Map
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground">
              Recent public specimens from collectors worldwide
            </p>
            {!isLoading && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {specimens.length} specimens
              </span>
            )}
          </div>
        </div>

        {/* Map */}
        {isError ? (
          <div
            className="rounded-lg border border-destructive/50 bg-destructive/5 flex items-center justify-center"
            style={{ height: "calc(100vh - 200px)" }}
          >
            <p className="text-sm text-destructive">Failed to load map data. Please try refreshing.</p>
          </div>
        ) : isLoading ? (
          <div
            className="rounded-lg bg-muted/30 animate-pulse"
            style={{ height: "calc(100vh - 200px)" }}
          />
        ) : (
          <ExploreMap specimens={specimens} />
        )}
      </main>
    </div>
  )
}
