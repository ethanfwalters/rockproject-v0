"use client"

import { useMemo } from "react"
import { MapRenderer } from "@/features/map/presentation/map-renderer"
import type { MapMarker } from "@/features/map/domain/types"
import type { PublicMapSpecimen } from "../domain/types"

interface ExploreMapProps {
  specimens: PublicMapSpecimen[]
}

export function ExploreMap({ specimens }: ExploreMapProps) {
  const markers: MapMarker[] = useMemo(() => {
    return specimens.map((s) => ({
      id: s.id,
      lat: s.locality.latitude,
      lng: s.locality.longitude,
      popupContent: (
        <div className="p-1">
          <p className="font-semibold text-sm">
            {s.mineralNames.join(", ") || "Specimen"}
          </p>
          <p className="text-xs text-muted-foreground">
            {s.locality.displayName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            by {s.addedBy}
          </p>
        </div>
      ),
    }))
  }, [specimens])

  return (
    <MapRenderer
      markers={markers}
      height="calc(100vh - 200px)"
      emptyMessage="No public specimens with coordinates yet"
    />
  )
}
