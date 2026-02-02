"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchSpecimenById } from "@/features/specimenViewer/application/client/fetchSpecimen"
import { updateSpecimen, deleteSpecimen } from "@/features/landingPage/application/client/specimenCrud"
import { SpecimenDetail } from "@/features/specimenDetail/presentation/specimen-detail"
import type { UpdateSpecimenInput } from "@/types/specimen"

interface SpecimenViewerProps {
  specimenId: string | null
  onClose: () => void
}

export function SpecimenViewer({ specimenId, onClose }: SpecimenViewerProps) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["specimen", specimenId],
    queryFn: () => fetchSpecimenById(specimenId!),
    enabled: !!specimenId,
  })

  const updateMutation = useMutation({
    mutationFn: updateSpecimen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specimen", specimenId] })
      queryClient.invalidateQueries({ queryKey: ["specimens"] })
      queryClient.invalidateQueries({ queryKey: ["recentSpecimens"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSpecimen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specimens"] })
      queryClient.invalidateQueries({ queryKey: ["recentSpecimens"] })
      onClose()
    },
  })

  if (!specimenId) return null

  if (isLoading || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="h-12 w-12 mx-auto rounded-full bg-primary/20" />
          </div>
          <p className="text-muted-foreground">Loading specimen...</p>
        </div>
      </div>
    )
  }

  const handleUpdate = (specimen: UpdateSpecimenInput) => {
    updateMutation.mutate(specimen)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  return (
    <SpecimenDetail
      specimen={data.specimen}
      onClose={onClose}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      isUpdating={updateMutation.isPending}
      isDeleting={deleteMutation.isPending}
      readOnly={!data.isOwner}
    />
  )
}
