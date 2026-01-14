"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Label } from "./label"

interface DimensionsInputProps {
  length?: number
  width?: number
  height?: number
  onChange: (dims: { length?: number; width?: number; height?: number }) => void
  className?: string
}

export function DimensionsInput({
  length,
  width,
  height,
  onChange,
  className,
}: DimensionsInputProps) {
  const handleChange = (field: "length" | "width" | "height", value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value)
    onChange({
      length: field === "length" ? numValue : length,
      width: field === "width" ? numValue : width,
      height: field === "height" ? numValue : height,
    })
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="length">Length (mm)</Label>
          <Input
            id="length"
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
            value={length ?? ""}
            onChange={(e) => handleChange("length", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="width">Width (mm)</Label>
          <Input
            id="width"
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
            value={width ?? ""}
            onChange={(e) => handleChange("width", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="height">Height (mm)</Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
            value={height ?? ""}
            onChange={(e) => handleChange("height", e.target.value)}
          />
        </div>
      </div>
      {(length || width || height) && (
        <div className="text-sm text-muted-foreground">
          {[length, width, height].filter(Boolean).join(" x ")} mm
        </div>
      )}
    </div>
  )
}

export function formatDimensions(length?: number, width?: number, height?: number): string | null {
  const dims = [length, width, height].filter((d) => d !== undefined && d !== null)
  if (dims.length === 0) return null
  return dims.join(" x ") + " mm"
}
