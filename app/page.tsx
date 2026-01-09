"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Specimen } from "@/types/specimen"
import { CollectionOverview } from "@/components/collection-overview"
import { AddSpecimenFlow } from "@/components/add-specimen-flow"
import { SpecimenDetail } from "@/components/specimen-detail"
import { CollectionStats } from "@/components/collection-stats"
import { Navbar } from "@/components/navbar"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

async function fetchSpecimens(): Promise<Specimen[]> {
  const response = await fetch("/api/specimens")
  if (response.status === 401) {
    throw new Error("Unauthorized")
  }
  const data = await response.json()
  return data.specimens
}

async function addSpecimen(specimen: Omit<Specimen, "id" | "dateAdded">): Promise<Specimen> {
  const response = await fetch("/api/specimens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(specimen),
  })
  const data = await response.json()
  return data.specimen
}

async function updateSpecimen(specimen: Specimen): Promise<Specimen> {
  const response = await fetch("/api/specimens", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(specimen),
  })
  const data = await response.json()
  return data.specimen
}

async function deleteSpecimen(id: string): Promise<void> {
  await fetch(`/api/specimens?id=${id}`, {
    method: "DELETE",
  })
}

export default function Home() {
  const [isAddingSpecimen, setIsAddingSpecimen] = useState(false)
  const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || "")
      }
    }
    getUser()
  }, [])

  const { data: specimens = [], isLoading } = useQuery({
    queryKey: ["specimens"],
    queryFn: fetchSpecimens,
  })

  const addSpecimenMutation = useMutation({
    mutationFn: addSpecimen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specimens"] })
      setIsAddingSpecimen(false)
    },
  })

  const updateSpecimenMutation = useMutation({
    mutationFn: updateSpecimen,
    onSuccess: (updatedSpecimen) => {
      queryClient.invalidateQueries({ queryKey: ["specimens"] })
      setSelectedSpecimen(updatedSpecimen)
    },
  })

  const deleteSpecimenMutation = useMutation({
    mutationFn: deleteSpecimen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specimens"] })
      setSelectedSpecimen(null)
    },
  })

  const handleAddSpecimen = (specimen: Omit<Specimen, "id" | "dateAdded">) => {
    addSpecimenMutation.mutate(specimen)
  }

  const handleUpdateSpecimen = (specimen: Specimen) => {
    updateSpecimenMutation.mutate(specimen)
  }

  const handleDeleteSpecimen = (id: string) => {
    deleteSpecimenMutation.mutate(id)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-pulse mb-4">
                <div className="h-12 w-12 mx-auto rounded-full bg-primary/20" />
              </div>
              <p className="text-muted-foreground">Loading your collection...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-balance">Your Collection</h1>
            <p className="mt-2 text-muted-foreground">
              {specimens.length} specimen{specimens.length !== 1 ? "s" : ""} collected
              {userEmail && <span className="ml-2">• {userEmail}</span>}
            </p>
          </div>
          <Button size="lg" onClick={() => setIsAddingSpecimen(true)} className="gap-2 rounded-full">
            <Plus className="h-5 w-5" />
            Add Specimen
          </Button>
        </div>

        {/* Collection Grid and Stats Panel */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Collection Grid */}
          <div className="flex-1">
            <CollectionOverview specimens={specimens} onSelectSpecimen={setSelectedSpecimen} />
          </div>

          {/* Stats Panel */}
          <div className="lg:w-80 xl:w-96">
            <CollectionStats specimens={specimens} />
          </div>
        </div>
      </main>

      {/* Add Specimen Flow */}
      {isAddingSpecimen && <AddSpecimenFlow onClose={() => setIsAddingSpecimen(false)} onAdd={handleAddSpecimen} />}

      {selectedSpecimen && (
        <SpecimenDetail
          specimen={selectedSpecimen}
          onClose={() => setSelectedSpecimen(null)}
          onUpdate={handleUpdateSpecimen}
          onDelete={handleDeleteSpecimen}
          isUpdating={updateSpecimenMutation.isPending}
          isDeleting={deleteSpecimenMutation.isPending}
        />
      )}
    </div>
  )
}
