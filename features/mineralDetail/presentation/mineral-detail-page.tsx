"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { Mineral } from "@/types/mineral"
import type { Specimen, UpdateSpecimenInput } from "@/types/specimen"
import { Button } from "@/features/shared/presentation/button"
import { Card } from "@/features/shared/presentation/card"
import { SpecimenDetail } from "@/features/specimenDetail/presentation/specimen-detail"
import { ArrowLeft, ImageIcon } from "lucide-react"
import {
  fetchSpecimens,
  updateSpecimen,
  deleteSpecimen,
} from "@/features/landingPage/application/client/specimenCrud"

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

function formatChemicalFormula(formula: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let i = 0
  let key = 0

  while (i < formula.length) {
    // Check for charge notation like 2+, 3+, 2-, etc. (superscript)
    if (/^\d+[+-]/.test(formula.slice(i))) {
      const match = formula.slice(i).match(/^(\d+[+-])/)
      if (match) {
        parts.push(<sup key={key++} className="text-[0.65em]">{match[1]}</sup>)
        i += match[1].length
        continue
      }
    }

    // Check for standalone + or - charge (superscript)
    if ((formula[i] === '+' || formula[i] === '-') && i > 0 && /[A-Za-z)\]]/.test(formula[i - 1])) {
      parts.push(<sup key={key++} className="text-[0.65em]">{formula[i]}</sup>)
      i++
      continue
    }

    // Check for numbers that should be subscripts (after letters, parentheses, or brackets)
    if (/\d/.test(formula[i]) && i > 0 && /[A-Za-z)\]>]/.test(formula[i - 1])) {
      let numStr = ''
      while (i < formula.length && /[\d.]/.test(formula[i]) && !/[+-]/.test(formula[i + 1] || '')) {
        // Check if next char after digits is + or - (then it's a charge, not subscript)
        if (/\d/.test(formula[i])) {
          const remaining = formula.slice(i)
          const chargeMatch = remaining.match(/^(\d+)([+-])/)
          if (chargeMatch) {
            // This is a charge like "2+" - don't treat as subscript
            break
          }
        }
        numStr += formula[i]
        i++
      }
      if (numStr) {
        parts.push(<sub key={key++} className="text-[0.75em]">{numStr}</sub>)
        continue
      }
    }

    // Regular character
    parts.push(<span key={key++}>{formula[i]}</span>)
    i++
  }

  return parts
}

export function MineralDetailPage({ mineralId }: MineralDetailPageProps) {
  const router = useRouter()
  const [mineral, setMineral] = useState<Mineral | null>(null)
  const [specimens, setSpecimens] = useState<SpecimenPreview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleSpecimenClick = async (specimenId: string) => {
    // Fetch the full specimen data from user's collection
    const allSpecimens = await fetchSpecimens()
    const specimen = allSpecimens.find((s) => s.id === specimenId)
    if (specimen) {
      setSelectedSpecimen(specimen)
    }
  }

  const handleUpdateSpecimen = async (updated: UpdateSpecimenInput) => {
    setIsUpdating(true)
    try {
      const updatedSpecimen = await updateSpecimen(updated)
      setSelectedSpecimen(updatedSpecimen)
      // Refresh the mineral page data
      const response = await fetch(`/api/minerals/${mineralId}`)
      const data = await response.json()
      setSpecimens(data.specimens || [])
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteSpecimen = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteSpecimen(id)
      setSelectedSpecimen(null)
      // Refresh the mineral page data
      const response = await fetch(`/api/minerals/${mineralId}`)
      const data = await response.json()
      setSpecimens(data.specimens || [])
    } finally {
      setIsDeleting(false)
    }
  }

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

        <Card className="border-0 bg-card overflow-hidden">
          <div className="grid md:grid-cols-[280px_1fr] gap-0">
            {/* Image Area */}
            <div className="relative aspect-square md:aspect-auto md:h-full min-h-[280px] bg-gradient-to-br from-violet-500/5 via-muted to-indigo-500/5">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <img
                  src="/mineral-placeholder.svg"
                  alt=""
                  className="w-full h-full max-w-[200px] max-h-[200px] opacity-90"
                />
              </div>
            </div>

            {/* Info Area */}
            <div className="p-6 md:p-8">
              <div className="mb-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mineral</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{mineral.name}</h1>

              {mineral.chemicalFormula && (
                <div className="mb-6">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Chemical Formula
                  </span>
                  <p className="text-xl mt-1 font-medium tracking-wide">
                    {formatChemicalFormula(mineral.chemicalFormula)}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {!mineral.chemicalFormula && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      More information about this mineral will be available soon.
                    </p>
                  </div>
                )}
              </div>
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
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No public specimens with this mineral yet.</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specimens.map((specimen) => {
                const CardContent = (
                  <Card className={`border-0 bg-card overflow-hidden transition-shadow ${specimen.isOwn ? "hover:shadow-lg cursor-pointer" : ""}`}>
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
                          <ImageIcon className="h-12 w-12 opacity-20" />
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
                )

                return specimen.isOwn ? (
                  <div
                    key={specimen.id}
                    onClick={() => handleSpecimenClick(specimen.id)}
                    className="block"
                  >
                    {CardContent}
                  </div>
                ) : (
                  <div key={specimen.id}>{CardContent}</div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Specimen Detail Modal */}
      {selectedSpecimen && (
        <SpecimenDetail
          specimen={selectedSpecimen}
          onClose={() => setSelectedSpecimen(null)}
          onUpdate={handleUpdateSpecimen}
          onDelete={handleDeleteSpecimen}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}
