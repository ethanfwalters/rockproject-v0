import { SpecimenForm } from "@/features/admin/presentation/specimen-form"

export default async function EditSpecimenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <SpecimenForm specimenId={id} />
}
