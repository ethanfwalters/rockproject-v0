import { ReactNode } from "react"

export interface MapMarker {
  id: string | number
  lat: number
  lng: number
  popupContent?: ReactNode
}

export interface MapRendererProps {
  markers: MapMarker[]
  height?: string
  aspectRatio?: string
  zoom?: number
  center?: [number, number]
  emptyMessage?: string
  className?: string
}
