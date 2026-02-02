"use client"

import { Card } from "@/features/shared/presentation/card"
import { MapRenderer } from "@/features/map/presentation/map-renderer"
import type { MapMarker } from "@/features/map/domain/types"
import type { LocalityMapProps } from "../domain/types"

export function LocalityMap({ locality, height = "200px" }: LocalityMapProps) {
  const hasCoordinates =
    locality.latitude !== undefined &&
    locality.latitude !== null &&
    locality.longitude !== undefined &&
    locality.longitude !== null

  const markers: MapMarker[] = hasCoordinates
    ? [{ id: locality.id, lat: locality.latitude!, lng: locality.longitude! }]
    : []

  return (
    <Card className="border-0 bg-card mb-6 overflow-hidden">
      <MapRenderer
        markers={markers}
        height={height}
        zoom={10}
        center={hasCoordinates ? [locality.latitude!, locality.longitude!] : undefined}
        emptyMessage="No coordinates available"
      />
    </Card>
  )
}
