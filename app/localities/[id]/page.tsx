import { LocalityDetailPage } from "@/features/localityDetail/presentation/locality-detail-page"

type Params = Promise<{ id: string }>

export default async function Page({ params }: { params: Params }) {
  const { id } = await params
  return <LocalityDetailPage localityId={id} />
}
