"use client"

import { useState, useEffect } from "react"
import type { Specimen, UpdateSpecimenInput } from "@/types/specimen"
import { Button } from "@/features/shared/presentation/button"
import { Card } from "@/features/shared/presentation/card"
import { X, MapPin, Calendar, Pencil, Trash2, Gem, Ruler } from "lucide-react"
import { EditSpecimenForm } from "../../specimenEdit/presentation/edit-specimen-form"
import { CollectionMap } from "../../collection/presentation/collection-map"
import { formatDimensions } from "@/features/shared/presentation/dimensions-input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/shared/presentation/alert-dialog"

interface SpecimenDetailProps {
  specimen: Specimen
  onClose: () => void
  onUpdate: (specimen: UpdateSpecimenInput) => void
  onDelete: (id: string) => void
  isUpdating: boolean
  isDeleting: boolean
}

export function SpecimenDetail({
  specimen,
  onClose,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: SpecimenDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isImageFullscreen, setIsImageFullscreen] = useState(false)

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  // Handle escape key to close fullscreen image
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isImageFullscreen) {
        setIsImageFullscreen(false)
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isImageFullscreen])

  const handleSave = (updatedSpecimen: UpdateSpecimenInput) => {
    onUpdate(updatedSpecimen)
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete(specimen.id)
    setShowDeleteDialog(false)
  }

  // Get display name from primary mineral
  const displayName =
    specimen.minerals && specimen.minerals.length > 0
      ? specimen.minerals[0].name
      : "Specimen"

  // Check if specimen has coordinates (from locality)
  const hasCoordinates =
    specimen.locality?.latitude !== undefined &&
    specimen.locality?.latitude !== null &&
    specimen.locality?.longitude !== undefined &&
    specimen.locality?.longitude !== null

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-sm">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-2xl animate-in fade-in zoom-in-95 duration-300">
            <Card className="border-0 bg-card p-6">
              <EditSpecimenForm
                specimen={specimen}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
                isSaving={isUpdating}
              />
            </Card>
          </div>
        </div>
      </div>
    )
  }

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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Image */}
            <div className="overflow-hidden rounded-lg self-start">
              {specimen.imageUrl ? (
                <>
                  <img
                    src={specimen.imageUrl}
                    alt={displayName}
                    className="w-full h-auto cursor-pointer transition-opacity hover:opacity-90"
                    onClick={() => setIsImageFullscreen(true)}
                    onError={(e) => {
                      const target = e.currentTarget
                      target.style.display = "none"
                      const fallback = target.nextElementSibling
                      if (fallback) {
                        fallback.classList.remove("hidden")
                        fallback.classList.add("flex")
                      }
                    }}
                  />
                  <div className="hidden h-[300px] bg-muted items-center justify-center rounded-lg">
                    <Gem className="h-24 w-24 opacity-20" />
                  </div>
                </>
              ) : (
                <Card className="overflow-hidden border-0 bg-card">
                  <div className="relative h-[300px] bg-muted flex items-center justify-center">
                    <Gem className="h-24 w-24 opacity-20" />
                  </div>
                </Card>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              {/* Minerals */}
              <div>
                <h1 className="text-4xl font-bold text-balance">{displayName}</h1>
                {specimen.minerals && specimen.minerals.length > 1 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {specimen.minerals.slice(1).map((mineral, index) => (
                      <span
                        key={mineral.id}
                        className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                      >
                        {index === 0 ? "Secondary: " : ""}
                        {mineral.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {specimen.locality && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {specimen.locality.fullPath || specimen.locality.name}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Added {new Date(specimen.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Minerals list with ranks */}
              {specimen.minerals && specimen.minerals.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Gem className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-medium text-muted-foreground">Minerals</h2>
                  </div>
                  <Card className="border-0 bg-muted/50 p-4">
                    <div className="space-y-2">
                      {specimen.minerals.map((mineral, index) => (
                        <div key={mineral.id} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-16">
                            {index === 0
                              ? "Primary"
                              : index === 1
                                ? "Secondary"
                                : index === 2
                                  ? "Tertiary"
                                  : `${index + 1}th`}
                          </span>
                          <span className="font-medium">{mineral.name}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Dimensions */}
              {formatDimensions(specimen.length, specimen.width, specimen.height) && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-medium text-muted-foreground">Dimensions</h2>
                  </div>
                  <Card className="border-0 bg-muted/50 p-4">
                    <p className="font-medium">
                      {formatDimensions(specimen.length, specimen.width, specimen.height)}
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      {specimen.length && (
                        <div>
                          <span className="block text-xs">Length</span>
                          <span className="font-medium text-foreground">{specimen.length} mm</span>
                        </div>
                      )}
                      {specimen.width && (
                        <div>
                          <span className="block text-xs">Width</span>
                          <span className="font-medium text-foreground">{specimen.width} mm</span>
                        </div>
                      )}
                      {specimen.height && (
                        <div>
                          <span className="block text-xs">Height</span>
                          <span className="font-medium text-foreground">{specimen.height} mm</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Map */}
              {hasCoordinates && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Location</h2>
                  <Card className="border-0 bg-card overflow-hidden">
                    <div className="h-[250px] w-full">
                      <CollectionMap specimens={[specimen]} height="250px" showCard={false} />
                    </div>
                    <div className="p-3 border-t border-border bg-muted/30">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {specimen.locality?.latitude?.toFixed(4)}°,{" "}
                        {specimen.locality?.longitude?.toFixed(4)}°
                      </p>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {isImageFullscreen && specimen.imageUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsImageFullscreen(false)}
        >
          <button
            onClick={() => setIsImageFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors z-10"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={specimen.imageUrl}
            alt={displayName}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete specimen?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {displayName} specimen? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
