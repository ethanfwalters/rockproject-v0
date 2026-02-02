"use client"

import { useMemo } from "react"
import { Card } from "@/features/shared/presentation/card"
import { MapRenderer } from "@/features/map/presentation/map-renderer"
import type { MapMarker } from "@/features/map/domain/types"
import type { CollectionMapProps } from "../domain/types"

export function CollectionMap({ specimens, height, showCard = true }: CollectionMapProps) {
  const markers: MapMarker[] = useMemo(() => {
    return specimens
      .filter(
        (s) =>
          s.locality?.latitude !== undefined &&
          s.locality?.latitude !== null &&
          s.locality?.longitude !== undefined &&
          s.locality?.longitude !== null
      )
      .map((s) => ({
        id: s.id,
        lat: s.locality!.latitude!,
        lng: s.locality!.longitude!,
        popupContent: (
          <div className="p-1">
            <p className="font-semibold text-sm">
              {(s.minerals || []).map((m) => m.name).join(", ") || "Specimen"}
            </p>
            <p className="text-xs text-muted-foreground">
              {s.locality!.fullPath || s.locality!.name}
            </p>
          </div>
        ),
      }))
  }, [specimens])

  const mapContent = (
    <MapRenderer
      markers={markers}
      height={height}
      emptyMessage="Add localities with coordinates to see your specimens on the map"
    />
  )

  if (!showCard) {
    return mapContent
  }

  return (
    <Card className="border-0 bg-card p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          Collection Map
        </h3>
      </div>

      {mapContent}

      {markers.length > 0 && (
        <div className="mt-3 text-xs text-muted-foreground">
          {markers.length} specimen{markers.length !== 1 ? "s" : ""} with coordinates
        </div>
      )}
    </Card>
  )
}
