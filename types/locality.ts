export type Locality = {
  id: string
  name: string
  latitude?: number
  longitude?: number
  kind: string
  parentId?: string
  createdAt: string
}

export type LocalityWithAncestors = Locality & {
  ancestors: Locality[] // From immediate parent to root (country)
  fullPath: string // "Mine Name, District, State, Country"
}

export type LocalityTree = Locality & {
  children: LocalityTree[]
}

export type CreateLocalityInput = {
  name: string
  latitude?: number
  longitude?: number
  kind: string
  parentId?: string
}

export type SpecimenPreview = {
  id: string
  imageUrl: string | null
  createdAt: string
  minerals: Array<{ id: string; name: string }>
  isPublic: boolean
  isOwn: boolean
}

export type LocalityDetail = {
  locality: LocalityWithAncestors
  children: Locality[]
  specimens: SpecimenPreview[]
  specimenCount: number
}
