"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/features/shared/presentation/card"
import { MapPin, ChevronRight } from "lucide-react"
import type { ChildLocalitiesListProps } from "../domain/types"

export function ChildLocalitiesList({ localities }: ChildLocalitiesListProps) {
  if (localities.length === 0) {
    return null
  }

  return (
    <Card className="border-0 bg-card mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Sub-localities ({localities.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {localities.map((locality) => (
            <Link
              key={locality.id}
              href={`/localities/${locality.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{locality.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{locality.kind}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
