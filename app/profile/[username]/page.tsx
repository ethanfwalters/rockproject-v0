import { PublicProfilePage } from "@/features/publicProfile/presentation/public-profile-page"

type Params = Promise<{ username: string }>

export default async function Page({ params }: { params: Params }) {
  const { username } = await params
  return <PublicProfilePage username={username} />
}
