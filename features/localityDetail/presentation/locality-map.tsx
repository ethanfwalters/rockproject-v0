"use client"

import { useEffect, useState } from "react"
import { Card } from "@/features/shared/presentation/card"
import dynamic from "next/dynamic"
import type { LocalityWithAncestors } from "@/types/locality"

interface LocalityMapProps {
  locality: LocalityWithAncestors
  height?: string
}

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
})
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })

export function LocalityMap({ locality, height = "200px" }: LocalityMapProps) {
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

  const hasCoordinates =
    locality.latitude !== undefined &&
    locality.latitude !== null &&
    locality.longitude !== undefined &&
    locality.longitude !== null

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

  if (!hasCoordinates) {
    return (
      <Card className="border-0 bg-card mb-6 overflow-hidden">
        <div
          className="flex items-center justify-center bg-muted/30 rounded-lg"
          style={{ height }}
        >
          <p className="text-sm text-muted-foreground">No coordinates available</p>
        </div>
      </Card>
    )
  }

  if (!isMounted || !leafletModule) {
    return (
      <Card className="border-0 bg-card mb-6 overflow-hidden">
        <div
          className="flex items-center justify-center bg-muted/30 rounded-lg"
          style={{ height }}
        >
          <div className="animate-pulse text-sm text-muted-foreground">Loading map...</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-0 bg-card mb-6 overflow-hidden">
      <div className="rounded-lg overflow-hidden" style={{ height }}>
        <MapContainer
          center={[locality.latitude!, locality.longitude!]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[locality.latitude!, locality.longitude!]} icon={createIcon()} />
        </MapContainer>
      </div>
    </Card>
  )
}
