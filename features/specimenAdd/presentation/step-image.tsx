"use client"

import { ChevronRight, Image as ImageIcon } from "lucide-react"
import { Button } from "@/features/shared/presentation/button"
import { ImageUpload } from "@/features/shared/presentation/image-upload"

interface StepImageProps {
  imageUrl: string | undefined
  onImageUrlChange: (url: string | undefined) => void
  onCancel: () => void
  onNext: () => void
}

export function StepImage({ imageUrl, onImageUrlChange, onCancel, onNext }: StepImageProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-balance">Add a Photo</h2>
            <p className="mt-1 text-muted-foreground">Show off your specimen (optional)</p>
          </div>
        </div>
      </div>

      <ImageUpload
        currentImageUrl={imageUrl ?? ""}
        onImageUrlChange={(url) => onImageUrlChange(url || undefined)}
      />

      <div className="flex justify-between gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onNext} className="gap-2">
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
