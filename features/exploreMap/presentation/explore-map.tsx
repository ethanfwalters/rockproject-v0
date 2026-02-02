"use client"

import { useMemo, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { PublicMapSpecimen } from "../domain/types"

// 5a: Dynamic imports for react-leaflet (no SSR)
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
})
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

// 5b: Props interface
interface ExploreMapProps {
  specimens: PublicMapSpecimen[]
}

export function ExploreMap({ specimens }: ExploreMapProps) {
  // 5c: State and effects
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

  // 5d: Compute markers
  const markers = useMemo(() => {
    return specimens.map((s) => ({
      id: s.id,
      mineralNames: s.mineralNames,
      addedBy: s.addedBy,
      locality: s.locality,
      lat: s.locality.latitude,
      lng: s.locality.longitude,
    }))
  }, [specimens])

  // 5e: Create map icon
  const markerColor = "#3b82f6"

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

  // 5f: Compute map center
  const mapCenter = useMemo(() => {
    if (markers.length === 0) return [20, 0] as [number, number]
    const avgLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length
    const avgLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length
    return [avgLat, avgLng] as [number, number]
  }, [markers])

  // 5h: Handle empty state
  if (specimens.length === 0) {
    return (
      <div
        className="rounded-lg bg-muted/30 flex items-center justify-center"
        style={{ height: "calc(100vh - 200px)" }}
      >
        <p className="text-sm text-muted-foreground text-center px-4">
          No public specimens with coordinates yet
        </p>
      </div>
    )
  }

  // 5g: Loading state
  if (!isMounted || !leafletModule) {
    return (
      <div
        className="rounded-lg bg-muted/30 flex items-center justify-center"
        style={{ height: "calc(100vh - 200px)" }}
      >
        <div className="animate-pulse text-sm text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  // 5g: Render the map
  return (
    <div className="rounded-lg overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
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
                  {marker.mineralNames.join(", ") || "Specimen"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {marker.locality.displayName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  by {marker.addedBy}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
