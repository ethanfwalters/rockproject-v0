"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { Locality } from "@/types/locality"

interface LocalityBreadcrumbProps {
  ancestors: Locality[]
  current: Locality
}

export function LocalityBreadcrumb({ ancestors, current }: LocalityBreadcrumbProps) {
  // Reverse ancestors to show root first: Country > State > County > Current
  const reversedAncestors = [...ancestors].reverse()

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4 flex-wrap">
      <Link href="/" className="hover:text-foreground transition-colors">
        Collection
      </Link>
      {reversedAncestors.map((ancestor) => (
        <span key={ancestor.id} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 shrink-0" />
          <Link
            href={`/localities/${ancestor.id}`}
            className="hover:text-foreground transition-colors"
          >
            {ancestor.name}
          </Link>
        </span>
      ))}
      <span className="flex items-center gap-1">
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="font-medium text-foreground">{current.name}</span>
      </span>
    </nav>
  )
}
