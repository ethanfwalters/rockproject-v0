"use client"

import { Card } from "@/features/shared/presentation/card"
import { Button } from "@/features/shared/presentation/button"
import { Pencil, MapPin, Calendar } from "lucide-react"
import type { LocalityWithAncestors } from "@/types/locality"

interface LocalityHeaderProps {
  locality: LocalityWithAncestors
  onEdit?: () => void
}

export function LocalityHeader({ locality, onEdit }: LocalityHeaderProps) {
  const hasCoordinates =
    locality.latitude !== undefined &&
    locality.latitude !== null &&
    locality.longitude !== undefined &&
    locality.longitude !== null

  return (
    <Card className="border-0 bg-card mb-6 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {locality.kind}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{locality.name}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {hasCoordinates && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {locality.latitude!.toFixed(4)}°, {locality.longitude!.toFixed(4)}°
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Added {new Date(locality.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-2 shrink-0">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
