"use client"

import { useMemo, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { MapRendererProps } from "../domain/types"

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
})
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

export function MapRenderer({
  markers,
  height,
  aspectRatio = "4/3",
  zoom,
  center,
  emptyMessage = "No locations to display",
  className,
}: MapRendererProps) {
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

  const createIcon = () => {
    if (!leafletModule) return undefined
    return leafletModule.divIcon({
      className: "custom-marker",
      html: `<div style="
        background-color: #3b82f6;
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
    if (center) return center
    if (markers.length === 0) return [20, 0] as [number, number]
    const avgLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length
    const avgLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length
    return [avgLat, avgLng] as [number, number]
  }, [markers, center])

  const mapZoom = zoom ?? (markers.length === 1 ? 8 : 2)

  const sizeStyle = { height: height || "auto", aspectRatio: height ? undefined : aspectRatio }

  if (markers.length === 0) {
    return (
      <div
        className={`rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden ${className || ""}`}
        style={sizeStyle}
      >
        <p className="text-sm text-muted-foreground text-center px-4">{emptyMessage}</p>
      </div>
    )
  }

  if (!isMounted || !leafletModule) {
    return (
      <div
        className={`rounded-lg bg-muted/30 flex items-center justify-center ${className || ""}`}
        style={sizeStyle}
      >
        <div className="animate-pulse text-sm text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className || ""}`} style={sizeStyle}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={createIcon()}>
            {marker.popupContent && <Popup>{marker.popupContent}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
