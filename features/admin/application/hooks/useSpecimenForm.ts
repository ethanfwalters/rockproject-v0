"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { SpecimenFormData } from "@/features/admin/domain/types"
import {
  fetchAdminSpecimen,
  createAdminSpecimen,
  updateAdminSpecimen,
  prepareSubmitData,
} from "@/features/admin/application/client/specimensCrud"

const initialFormData: SpecimenFormData = {
  name: "",
  type: "mineral",
  hardness: "",
  luster: "",
  composition: "",
  streak: "",
  color: "",
  crystal_system: "",
  cleavage: "",
  fracture: "",
  specific_gravity: "",
  description: "",
  common_locations: "",
}

export function useSpecimenForm(specimenId?: string) {
  const router = useRouter()
  const isEditMode = !!specimenId
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<SpecimenFormData>(initialFormData)

  useEffect(() => {
    if (!specimenId) return

    async function loadSpecimen() {
      try {
        const spec = await fetchAdminSpecimen(specimenId!)
        setFormData({
          name: spec.name || "",
          type: spec.type || "mineral",
          hardness: spec.hardness || "",
          luster: spec.luster || "",
          composition: spec.composition || "",
          streak: spec.streak || "",
          color: spec.color || "",
          crystal_system: spec.crystal_system || "",
          cleavage: spec.cleavage || "",
          fracture: spec.fracture || "",
          specific_gravity: spec.specific_gravity || "",
          description: spec.description || "",
          common_locations: spec.common_locations ? spec.common_locations.join(", ") : "",
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadSpecimen()
  }, [specimenId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const submitData = prepareSubmitData(formData)

      if (isEditMode) {
        await updateAdminSpecimen(specimenId!, submitData)
      } else {
        await createAdminSpecimen(submitData)
      }

      router.push("/admin/specimens")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: keyof SpecimenFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return {
    isEditMode,
    loading,
    saving,
    error,
    formData,
    handleSubmit,
    updateField,
  }
}
