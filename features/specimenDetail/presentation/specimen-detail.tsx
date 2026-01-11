"use client"

import { useState } from "react"
import type { Specimen } from "@/types/specimen"
import { Button } from "@/features/shared/presentation/button"
import { Card } from "@/features/shared/presentation/card"
import { X, MapPin, Calendar, Pencil, Trash2, Tag } from "lucide-react"
import { EditSpecimenForm } from "../../specimenEdit/presentation/edit-specimen-form"
import { CollectionMap } from "../../collection/presentation/collection-map"
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
  onUpdate: (specimen: Specimen) => void
  onDelete: (id: string) => void
  isUpdating: boolean
  isDeleting: boolean
}

export function SpecimenDetail({ specimen, onClose, onUpdate, onDelete, isUpdating, isDeleting }: SpecimenDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleSave = (updatedSpecimen: Specimen) => {
    onUpdate(updatedSpecimen)
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete(specimen.id)
    setShowDeleteDialog(false)
  }

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
              <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => setIsEditing(true)}>
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
              <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize">
                {specimen.type}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Image */}
            <Card className="overflow-hidden border-0 bg-card self-start">
              <div className="relative h-[300px] bg-muted">
                {specimen.imageUrl ? (
                  <img
                    src={specimen.imageUrl}
                    alt={specimen.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget
                      target.style.display = "none"
                      const fallback = target.nextElementSibling
                      if (fallback) {
                        fallback.classList.remove("hidden")
                      }
                    }}
                  />
                ) : null}
                <div className={`flex h-full items-center justify-center ${specimen.imageUrl ? "hidden" : ""}`}>
                  <span className="text-9xl opacity-20">🪨</span>
                </div>
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

              {/* Tags */}
              {specimen.tags && specimen.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-medium text-muted-foreground">Tags</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {specimen.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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

              {specimen.coordinates && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Collection Location</h2>
                  <Card className="border-0 bg-card overflow-hidden">
                    <div className="h-[250px] w-full">
                      <CollectionMap specimens={[specimen]} height="250px" showCard={false} />
                    </div>
                    <div className="p-3 border-t border-border bg-muted/30">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {specimen.coordinates.lat.toFixed(4)}°, {specimen.coordinates.lng.toFixed(4)}°
                      </p>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete specimen?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{specimen.name}"? This action cannot be undone.
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
