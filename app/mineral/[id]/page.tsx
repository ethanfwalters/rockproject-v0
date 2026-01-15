import { MineralDetailPage } from "@/features/mineralDetail/presentation/mineral-detail-page"

type Params = Promise<{ id: string }>

export default async function Page({ params }: { params: Params }) {
  const { id } = await params
  return <MineralDetailPage mineralId={id} />
}
