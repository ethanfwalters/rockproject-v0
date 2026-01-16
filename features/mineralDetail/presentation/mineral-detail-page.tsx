"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Mineral } from "@/types/mineral"
import { Button } from "@/features/shared/presentation/button"
import { Card } from "@/features/shared/presentation/card"
import { ArrowLeft, Gem } from "lucide-react"

interface SpecimenPreview {
  id: string
  imageUrl: string | null
  createdAt: string
  minerals: Array<{ id: string; name: string }>
  isPublic: boolean
  isOwn: boolean
}

interface MineralDetailPageProps {
  mineralId: string
}

export function MineralDetailPage({ mineralId }: MineralDetailPageProps) {
  const router = useRouter()
  const [mineral, setMineral] = useState<Mineral | null>(null)
  const [specimens, setSpecimens] = useState<SpecimenPreview[]>([])
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
        setSpecimens(data.specimens || [])
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
          </div>
        </Card>

        {/* Specimens Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Specimens with {mineral.name}
          </h2>

          {specimens.length === 0 ? (
            <Card className="border-0 bg-card p-8">
              <div className="text-center text-muted-foreground">
                <Gem className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No specimens with this mineral yet.</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specimens.map((specimen) => (
                <Link key={specimen.id} href="/" className="block">
                  <Card className="border-0 bg-card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative aspect-square bg-muted">
                      {specimen.imageUrl ? (
                        <Image
                          src={specimen.imageUrl}
                          alt={specimen.minerals[0]?.name || "Specimen"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Gem className="h-12 w-12 opacity-20" />
                        </div>
                      )}
                      {specimen.isOwn && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                          Yours
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-medium truncate">
                        {specimen.minerals[0]?.name || "Unknown"}
                      </p>
                      {specimen.minerals.length > 1 && (
                        <p className="text-xs text-muted-foreground">
                          +{specimen.minerals.length - 1} more mineral{specimen.minerals.length > 2 ? "s" : ""}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Added {new Date(specimen.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
