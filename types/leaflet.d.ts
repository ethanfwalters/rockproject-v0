import type React from "react"

declare module "leaflet" {
  export interface IconOptions {
    iconUrl?: string
    iconRetinaUrl?: string
    iconSize?: [number, number]
    iconAnchor?: [number, number]
    popupAnchor?: [number, number]
    shadowUrl?: string
    shadowRetinaUrl?: string
    shadowSize?: [number, number]
    shadowAnchor?: [number, number]
    className?: string
  }

  export interface DivIconOptions {
    html?: string
    className?: string
    iconSize?: [number, number]
    iconAnchor?: [number, number]
    popupAnchor?: [number, number]
  }

  export interface Icon {
    options: IconOptions
  }

  export interface DivIcon {
    options: DivIconOptions
  }

  export interface IconDefault extends Icon {
    _getIconUrl?: () => string
  }

  export namespace Icon {
    class Default implements IconDefault {
      options: IconOptions
      _getIconUrl?: () => string
      static mergeOptions(options: Partial<IconOptions>): void
    }
  }

  export function icon(options: IconOptions): Icon
  export function divIcon(options: DivIconOptions): DivIcon

  export interface LatLngExpression {
    lat: number
    lng: number
  }
}

declare module "react-leaflet" {
  import type { ReactNode } from "react"

  export interface MapContainerProps {
    center: [number, number]
    zoom: number
    scrollWheelZoom?: boolean
    style?: React.CSSProperties
    children?: ReactNode
  }

  export interface TileLayerProps {
    attribution?: string
    url: string
  }

  export interface MarkerProps {
    position: [number, number]
    icon?: any
    children?: ReactNode
  }

  export interface PopupProps {
    children?: ReactNode
  }

  export const MapContainer: React.FC<MapContainerProps>
  export const TileLayer: React.FC<TileLayerProps>
  export const Marker: React.FC<MarkerProps>
  export const Popup: React.FC<PopupProps>
}
