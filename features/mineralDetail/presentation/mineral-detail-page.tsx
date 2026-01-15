"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Mineral } from "@/types/mineral"
import { Button } from "@/features/shared/presentation/button"
import { Card } from "@/features/shared/presentation/card"
import { ArrowLeft, Gem } from "lucide-react"

interface MineralDetailPageProps {
  mineralId: string
}

export function MineralDetailPage({ mineralId }: MineralDetailPageProps) {
  const router = useRouter()
  const [mineral, setMineral] = useState<Mineral | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMineral() {
      try {
        const response = await fetch(`/api/minerals/${mineralId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError("Mineral not found")
          } else {
            setError("Failed to load mineral")
          }
          return
        }
        const data = await response.json()
        setMineral(data.mineral)
      } catch {
        setError("Failed to load mineral")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMineral()
  }, [mineralId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !mineral) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">{error || "Mineral not found"}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="border-0 bg-card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Gem className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{mineral.name}</h1>
              <p className="text-sm text-muted-foreground">Mineral</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Name</h2>
              <p className="text-lg">{mineral.name}</p>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                More mineral information coming soon...
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
