"use client"

import { useState, useEffect, useCallback } from "react"
import type { CreateSpecimenInput } from "@/types/specimen"
import type { Mineral } from "@/types/mineral"
import { fetchMinerals } from "@/features/shared/application/client/mineralsCrud"
import { fetchLocalityWithAncestors } from "@/features/shared/application/client/localitiesCrud"
import { STEPS, type Step } from "../../domain/types"

const initialFormData: CreateSpecimenInput = {
  imageUrl: "",
  mineralIds: [],
  localityId: undefined,
  length: undefined,
  width: undefined,
  height: undefined,
  isPublic: false,
}

export function useAddSpecimenFlow() {
  const [step, setStep] = useState<Step>("image")
  const [formData, setFormData] = useState<CreateSpecimenInput>(initialFormData)
  const [minerals, setMinerals] = useState<Mineral[]>([])
  const [selectedMinerals, setSelectedMinerals] = useState<Mineral[]>([])
  const [localityName, setLocalityName] = useState<string>("")

  const currentStepIndex = STEPS.indexOf(step)
  const canProceed = formData.mineralIds && formData.mineralIds.length > 0

  // Load minerals on mount
  useEffect(() => {
    fetchMinerals().then(setMinerals).catch(console.error)
  }, [])

  // Fetch locality name when localityId changes
  useEffect(() => {
    if (formData.localityId) {
      fetchLocalityWithAncestors(formData.localityId)
        .then((loc) => setLocalityName(loc.fullPath))
        .catch(console.error)
    } else {
      setLocalityName("")
    }
  }, [formData.localityId])

  const updateFormData = useCallback(
    <K extends keyof CreateSpecimenInput>(key: K, value: CreateSpecimenInput[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const updateDimensions = useCallback(
    (dims: { length?: number; width?: number; height?: number }) => {
      setFormData((prev) => ({
        ...prev,
        length: dims.length,
        width: dims.width,
        height: dims.height,
      }))
    },
    []
  )

  const goToStep = useCallback((newStep: Step) => {
    setStep(newStep)
  }, [])

  const goToNextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setStep(STEPS[nextIndex])
    }
  }, [currentStepIndex])

  const goToPreviousStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setStep(STEPS[prevIndex])
    }
  }, [currentStepIndex])

  return {
    // State
    step,
    formData,
    minerals,
    selectedMinerals,
    localityName,
    currentStepIndex,
    canProceed,

    // Actions
    setStep: goToStep,
    goToNextStep,
    goToPreviousStep,
    updateFormData,
    updateDimensions,
    setSelectedMinerals,
  }
}
