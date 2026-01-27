"use client"

import { useMemo, useEffect, useState } from "react"
import { Card } from "@/features/shared/presentation/card"
import dynamic from "next/dynamic"
import type { CollectionMapProps } from "../domain/types"

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
})
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

export function CollectionMap({ specimens, height, showCard = true }: CollectionMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [leafletModule, setLeafletModule] = useState<typeof import("leaflet") | null>(null)

  useEffect(() => {
    setIsMounted(true)
    import("leaflet").then((L) => {
      setLeafletModule(L)
    })
    // @ts-ignore
    import("leaflet/dist/leaflet.css")
  }, [])

  // Get markers from specimens with locality coordinates
  const markers = useMemo(() => {
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
        minerals: s.minerals || [],
        locality: s.locality!,
        lat: s.locality!.latitude!,
        lng: s.locality!.longitude!,
      }))
  }, [specimens])

  // Use a single color for all markers since we no longer have type
  const markerColor = "#3b82f6" // Primary blue

  const createIcon = () => {
    if (!leafletModule) return undefined
    return leafletModule.divIcon({
      className: "custom-marker",
      html: `<div style="
        background-color: ${markerColor};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }

  const mapCenter = useMemo(() => {
    if (markers.length === 0) return [20, 0] as [number, number]
    const avgLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length
    const avgLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length
    return [avgLat, avgLng] as [number, number]
  }, [markers])

  const mapContent = (
    <>
      {markers.length === 0 ? (
        <div
          className="rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden"
          style={{ height: height || "auto", aspectRatio: height ? undefined : "4/3" }}
        >
          <p className="text-sm text-muted-foreground text-center px-4">
            Add localities with coordinates to see your specimens on the map
          </p>
        </div>
      ) : !isMounted || !leafletModule ? (
        <div
          className="rounded-lg bg-muted/30 flex items-center justify-center"
          style={{ height: height || "auto", aspectRatio: height ? undefined : "4/3" }}
        >
          <div className="animate-pulse text-sm text-muted-foreground">Loading map...</div>
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ height: height || "auto", aspectRatio: height ? undefined : "4/3" }}
        >
          <MapContainer
            center={mapCenter}
            zoom={markers.length === 1 ? 8 : 2}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker) => (
              <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={createIcon()}>
                <Popup>
                  <div className="p-1">
                    <p className="font-semibold text-sm">
                      {marker.minerals.map((m) => m.name).join(", ") || "Specimen"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {marker.locality.fullPath || marker.locality.name}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </>
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

      {/* Info */}
      {markers.length > 0 && (
        <div className="mt-3 text-xs text-muted-foreground">
          {markers.length} specimen{markers.length !== 1 ? "s" : ""} with coordinates
        </div>
      )}
    </Card>
  )
}
