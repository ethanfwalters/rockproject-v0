"use client"

import Image from "next/image"
import Link from "next/link"
import { Gem, MapPin } from "lucide-react"
import { Card } from "@/features/shared/presentation/card"

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

interface SpecimenCardProps {
  name: string
  imageUrl?: string | null
  locality?: string | null
  dateAdded: string
  showAuthor?: boolean
  author?: string
  additionalMineralsCount?: number
  dimensions?: string | null
  onClick?: () => void
  href?: string
}

export function SpecimenCard({
  name,
  imageUrl,
  locality,
  dateAdded,
  showAuthor = false,
  author,
  additionalMineralsCount,
  dimensions,
  onClick,
  href,
}: SpecimenCardProps) {
  const card = (
    <Card className="group cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Gem className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-balance">{name}</h3>
          {additionalMineralsCount != null && additionalMineralsCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary flex-shrink-0">
              +{additionalMineralsCount} more
            </span>
          )}
        </div>
        {locality && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{locality}</span>
          </p>
        )}
        {dimensions && (
          <p className="mt-1 text-xs text-muted-foreground">{dimensions}</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          {showAuthor && author ? (
            <>
              <span className="text-xs text-muted-foreground">by {author}</span>
              <span className="text-xs text-muted-foreground">{formatTimeAgo(dateAdded)}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              Added {new Date(dateAdded).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Card>
  )

  if (href) {
    return <Link href={href}>{card}</Link>
  }

  if (onClick) {
    return <div onClick={onClick}>{card}</div>
  }

  return card
}

export function SpecimenCardLoading() {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        <div className="h-4 w-36 bg-muted animate-pulse rounded" />
        <div className="pt-3 border-t border-border flex justify-between">
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </Card>
  )
}

export function SpecimenCardEmpty() {
  return (
    <Card className="overflow-hidden border-dashed">
      <div className="relative aspect-[4/3] bg-muted/30">
        <div className="flex h-full items-center justify-center">
          <Gem className="h-12 w-12 text-muted-foreground/20" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-muted-foreground/40">No specimen</h3>
        <p className="text-sm text-muted-foreground/30 flex items-center gap-1 mt-1">
          <MapPin className="h-3.5 w-3.5" />
          Waiting for additions
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground/30">---</span>
          <span className="text-xs text-muted-foreground/30">---</span>
        </div>
      </div>
    </Card>
  )
}
