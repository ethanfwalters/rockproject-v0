"use client"

import type { Specimen } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, MapPin, Calendar } from "lucide-react"
import Image from "next/image"

interface SpecimenDetailProps {
  specimen: Specimen
  onClose: () => void
}

export function SpecimenDetail({ specimen, onClose }: SpecimenDetailProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-sm">
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" onClick={onClose} className="gap-2">
              <X className="h-4 w-4" />
              Close
            </Button>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize">
              {specimen.type}
            </span>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Image */}
            <Card className="overflow-hidden border-0 bg-card">
              <div className="relative aspect-square bg-muted">
                {specimen.imageUrl ? (
                  <Image
                    src={specimen.imageUrl || "/placeholder.svg"}
                    alt={specimen.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-9xl opacity-20">🪨</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-balance">{specimen.name}</h1>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {specimen.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {specimen.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Added {new Date(specimen.dateAdded).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {specimen.description && (
                <Card className="border-0 bg-muted/50 p-4">
                  <p className="leading-relaxed">{specimen.description}</p>
                </Card>
              )}

              {specimen.details && Object.keys(specimen.details).length > 0 && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Details</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(specimen.details).map(([key, value]) => {
                      if (!value) return null
                      return (
                        <Card key={key} className="border-0 bg-card p-4">
                          <p className="text-xs text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          <p className="mt-1 font-semibold">{value}</p>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
