"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { LocalityWithAncestors, Locality, SpecimenPreview, CreateLocalityInput } from "@/types/locality"
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
import { fetchLocalityDetail } from "@/features/localityDetail/application/client/localityDetailCrud"
import { updateLocality } from "@/features/shared/application/client/localitiesCrud"
import { Navbar } from "@/features/navbar/presentation/navbar"
import { LocalityBreadcrumb } from "./locality-breadcrumb"
import { LocalityHeader } from "./locality-header"
import { LocalityMap } from "./locality-map"
import { ChildLocalitiesList } from "./child-localities-list"
import { EditLocalityForm } from "./edit-locality-form"
import type { LocalityDetailPageProps } from "../domain/types"

export function LocalityDetailPage({ localityId }: LocalityDetailPageProps) {
  const router = useRouter()
  const [locality, setLocality] = useState<LocalityWithAncestors | null>(null)
  const [children, setChildren] = useState<Locality[]>([])
  const [specimens, setSpecimens] = useState<SpecimenPreview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSavingLocality, setIsSavingLocality] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchLocalityDetail(localityId, {
          includeChildren: true,
          includeSpecimens: true,
          includeChildrenSpecimens: true,
        })
        setLocality(data.locality)
        setChildren(data.children)
        setSpecimens(data.specimens)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load locality")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [localityId])

  const handleSpecimenClick = async (specimenId: string) => {
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
      // Refresh specimens
      const data = await fetchLocalityDetail(localityId, {
        includeChildren: true,
        includeSpecimens: true,
        includeChildrenSpecimens: true,
      })
      setSpecimens(data.specimens)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteSpecimen = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteSpecimen(id)
      setSelectedSpecimen(null)
      // Refresh specimens
      const data = await fetchLocalityDetail(localityId, {
        includeChildren: true,
        includeSpecimens: true,
        includeChildrenSpecimens: true,
      })
      setSpecimens(data.specimens)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveLocality = async (data: Partial<CreateLocalityInput>) => {
    setIsSavingLocality(true)
    try {
      await updateLocality(localityId, data)
      // Refresh locality data
      const refreshedData = await fetchLocalityDetail(localityId, {
        includeChildren: true,
        includeSpecimens: true,
        includeChildrenSpecimens: true,
      })
      setLocality(refreshedData.locality)
      setChildren(refreshedData.children)
      setSpecimens(refreshedData.specimens)
      setIsEditing(false)
    } catch (err) {
      console.error("Failed to update locality:", err)
    } finally {
      setIsSavingLocality(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !locality) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">{error || "Locality not found"}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <LocalityBreadcrumb ancestors={locality.ancestors} current={locality} />

        <LocalityHeader locality={locality} onEdit={handleEdit} />

        <LocalityMap locality={locality} height="250px" />

        <ChildLocalitiesList localities={children} />

        {/* Specimens Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Specimens Found Here ({specimens.length})
          </h2>

          {specimens.length === 0 ? (
            <Card className="border-0 bg-card p-8">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No public specimens from this locality yet.</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specimens.map((specimen) => {
                const CardContent = (
                  <Card
                    className={`border-0 bg-card overflow-hidden transition-shadow ${
                      specimen.isOwn ? "hover:shadow-lg cursor-pointer" : ""
                    }`}
                  >
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
                          +{specimen.minerals.length - 1} more mineral
                          {specimen.minerals.length > 2 ? "s" : ""}
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

      {/* Edit Locality Modal */}
      {isEditing && locality && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-sm">
          <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-xl animate-in fade-in zoom-in-95 duration-300">
              <Card className="border-0 bg-card p-6">
                <EditLocalityForm
                  locality={locality}
                  onSave={handleSaveLocality}
                  onCancel={() => setIsEditing(false)}
                  isSaving={isSavingLocality}
                />
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
