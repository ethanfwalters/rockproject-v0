export type RecentSpecimen = {
  id: string
  name: string
  imageUrl: string | null
  locality: string | null
  addedBy: string
  createdAt: string
}

export async function fetchRecentSpecimens(): Promise<RecentSpecimen[]> {
  const response = await fetch("/api/specimens/recent")
  if (!response.ok) {
    throw new Error("Failed to fetch recent specimens")
  }
  const data = await response.json()
  return data.specimens
}
